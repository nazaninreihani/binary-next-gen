import { LiveApi } from 'binary-live-api';
import { showError, timeLeftToNextRealityCheck, nowAsEpoch } from 'binary-utils';
import difference from 'lodash/difference';
import * as actions from '../_actions';
import {
  CHANGE_INFO_FOR_ASSET, UPDATE_SETTINGS_FIELD, SERVER_DATA_STATES,
  UPDATE_UPGRADE_INFO, SET_AVAILABLE_CURRENCIES, SET_DEFAULT_CURRENCY, UPDATE_SUPPORTED_LANGUAGES
} from '../_constants/ActionTypes';
import { landingCompanyValue, getExistingCurrencies, groupCurrencies, populateCurrencyOptions } from '../_utils/Client';
import { addCurrencyToAccount } from '../_utils/AccountHelpers';
import languages from '../_constants/languages';

const handlers = {
    active_symbols: 'serverDataActiveSymbols',
    asset_index: 'serverDataAssetIndex',
    authorize: 'serverDataAuthorize',
    balance: 'serverDataBalance',
    candles: 'serverDataCandles',
    cashier_password: 'serverDataCashierLock',
    change_password: 'serverDataChangePassword',
    get_limits: 'serverDataAccountLimits',
    get_self_exclusion: 'serverDataAccountSelfExclusion',
    get_settings: 'serverDataAccountSettings',
    history: 'serverDataTickHistory',
    ohlc: 'serverDataOHLCStream',
    paymentagent_list: 'serverDataPaymentAgents',
    proposal_open_contract: 'serverDataProposalOpenContract',
    payout_currencies: 'serverDataPayoutCurrencies',
    proposal: 'serverDataProposal',
    portfolio: 'serverDataPortfolio',
    statement: 'serverDataStatement',
    time: 'serverDataTime',
    tick: 'serverDataTickStream',
    trading_times: 'serverDataTradingTimes',
    transaction: 'serverTransactionStream',
    residence_list: 'serverCountryList',
    website_status: 'serverDataWebsiteStatus',
};

// window does not exist when running test
const bootConfig = typeof window !== 'undefined' ? window.BinaryBoot : {};
const ApiConstructor = typeof WebSocket !== 'undefined' ? LiveApi : () => null;
export const api = new ApiConstructor(bootConfig);

const configForChart = Object.assign({ keepAlive: true }, bootConfig);
delete configForChart.connection;

export const changeLanguage = langCode => {
    api.changeLanguage(langCode);
    api.getActiveSymbolsFull();
    api.getAssetIndex();
    api.getTradingTimes(new Date());
};

export const getTickHistory = async (symbol) => {
    try {
        await api.getTickHistory(symbol, { end: 'latest', count: 10, subscribe: 1, adjust_start_time: 1 });
    } catch (err) {
        await api.getTickHistory(symbol, { end: 'latest', count: 10 });
    }
};
const initAuthorized = async (authData, store) => {
    if (/japan/.test(authData.authorize.landing_company_name)) {
        showError('Sorry, for japan user please login through www.binary.com ');
        store.dispatch(actions.updateAppState('authorized', false));
        store.dispatch(actions.updateToken(''));
        return;
    }

    const state = store.getState();

    api.unsubscribeFromAllTicks();
    api.unsubscribeFromAllProposals();
    api.unsubscribeFromAllPortfolios();
    api.unsubscribeFromAllOpenContracts();

    api.getLandingCompanyDetails(authData.authorize.landing_company_name)
        .then(r => {
            const details = r.landing_company_details;

            const acknowledged = state.realityCheck.get('acknowledged');
          if (details && details.has_reality_check) {
                if (!acknowledged) {
                    store
                        .dispatch(actions.updateRealityCheckSummary())
                        .then(() => store.dispatch(actions.initRealityCheck()));
                } else if (acknowledged) {
                  const hasSetRealityCheckAfterRefresh = state.appState.get('hasSetRealityCheckAfterRefresh');
                  const realityCheckStartTime = state.realityCheck.get('realityCheckStartTime');
                  const interval = state.realityCheck.get('interval');
                  const timeToWait = timeLeftToNextRealityCheck(realityCheckStartTime, interval) * 1000;

                  if (!hasSetRealityCheckAfterRefresh && realityCheckStartTime * 1000 + timeToWait > nowAsEpoch() * 1000) {
                    // store.dispatch(actions.updateAppState('hasSetRealityCheckAfterRefresh', true));
                    const timeToWaitAfterRefresh = (realityCheckStartTime * 1000 + timeToWait) - nowAsEpoch() * 1000;
                    store
                      .dispatch(actions.updateRealityCheckSummary())
                      .then(() => setTimeout(() =>
                          store.dispatch(actions.showRealityCheckPopUp()),
                        timeToWaitAfterRefresh
                      ));
                  } else {
                      store
                        .dispatch(actions.updateRealityCheckSummary())
                        .then(() => store.dispatch(actions.initRealityCheck()));
                  }
                }
            } else {
                store.dispatch(actions.disableRealityCheck());
            }
        });

    const subscribeToWatchlist = assets => {
        if (!state.watchlist) {
            return;
        }
        const existingWatchlist = state.watchlist.filter(w => assets.find(x => x.symbol === w));
        existingWatchlist.forEach(getTickHistory);
    };

    api.getActiveSymbolsFull().then(r => {
        const cachedParams = state.tradesParams.toJS();
        const tradableSymbols = r.active_symbols.filter(a => {
            const isOpen = a.exchange_is_open === 1;
            const allowStartLater = a.allow_forward_starting === 1;
            const suspended = a.is_trading_suspended === 1;
            return (!suspended && (isOpen || allowStartLater));
        });

        const firstOpenActiveSymbol = tradableSymbols.find(a => a.exchange_is_open === 1);
        let symbolToUse = firstOpenActiveSymbol ? firstOpenActiveSymbol.symbol : tradableSymbols[0].symbol;

        const layout = state.workspace.get('layoutN');

        if (cachedParams.length > 0) {
            const allowedSymbols = cachedParams
                .filter(c => tradableSymbols.some(a => a.symbol === c.symbol)).map(a => a.symbol);

            const needToAdd = cachedParams.length - allowedSymbols.length;

            const newSymbols = tradableSymbols.filter(a => a.exchange_is_open === 1).slice(0, needToAdd).map(a => a.symbol);

            const symbols = allowedSymbols.concat(newSymbols);

            symbolToUse = symbols[0];

            symbols.forEach((s, idx) => store.dispatch(actions.createTrade(idx, s)));
            store.dispatch(actions.updateActiveLayout(cachedParams.length, layout, symbols));
        } else {
            store.dispatch(actions.resetTrades());
            store.dispatch(actions.changeActiveLayout(1, 1));
        }

        if (symbolToUse) {
          store.dispatch(actions.getDailyPrices(symbolToUse));
          store.dispatch(actions.getTicksByCount(symbolToUse, 100, false));
          store.dispatch({ type: CHANGE_INFO_FOR_ASSET, symbol: symbolToUse });
        }

        subscribeToWatchlist(tradableSymbols);
    });

    api.getTradingTimes(new Date());
    api.getAssetIndex();
    api.getServerTime();

    const getUpgradeInfo = (landingCompany, upgradeableLandingCompanies, currentLandingCompany, accounts, currencyConfig) => {
        let canUpgrade = !!(upgradeableLandingCompanies && upgradeableLandingCompanies.length);
        let canUpgradeMultiAccount = false;
        let multi = false;
        let typeOfNextAccount;
        let currencyOptions;
        let allowedMarkets;
        if (canUpgrade) {
            canUpgradeMultiAccount =
              !!upgradeableLandingCompanies.find(lc => lc === currentLandingCompany);
        }
        const canUpgradeToLandingCompany = arr_landing_company => !!arr_landing_company.find(lc =>
          lc !== currentLandingCompany && upgradeableLandingCompanies.indexOf(lc) > -1);

        if (canUpgradeToLandingCompany(['costarica', 'malta', 'iom']) && !canUpgradeMultiAccount) {
            typeOfNextAccount = 'Real';
            currencyOptions = landingCompany.gaming_company ?
              landingCompany.gaming_company.legal_allowed_currencies :
              landingCompany.financial_company.legal_allowed_currencies;
            allowedMarkets = landingCompany.gaming_company ? landingCompany.gaming_company.legal_allowed_markets :
              landingCompany.financial_company.legal_allowed_markets;
        } else if (canUpgradeToLandingCompany(['maltainvest'])) {
            typeOfNextAccount = 'Financial';
            currencyOptions = landingCompany.financial_company.legal_allowed_currencies;
            allowedMarkets = landingCompany.financial_company.legal_allowed_markets;
        } else if (canUpgradeMultiAccount) {
            typeOfNextAccount = 'Real';
            allowedMarkets = landingCompany.financial_company.legal_allowed_markets;
            const legalAllowedCurrencies = landingCompany.financial_company.legal_allowed_currencies;
            const existingCurrencies = getExistingCurrencies(accounts);
            if (existingCurrencies.length) {
                const dividedExistingCurrencies = groupCurrencies(existingCurrencies, currencyConfig);
                const hasFiat = !!dividedExistingCurrencies.fiatCurrencies.length;
                if (hasFiat) {
                    const legalAllowedCryptoCurrencies =
                      groupCurrencies(legalAllowedCurrencies, currencyConfig).cryptoCurrencies;
                    const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                    currencyOptions = difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                    if (currencyOptions.length) {
                        canUpgrade = true;
                        multi = true;
                    }
                } else {
                    canUpgrade = true;
                    multi = true;
                    currencyOptions = difference(legalAllowedCurrencies, existingCurrencies);
                }
            } else {
                canUpgrade = true;
                multi = true;
                currencyOptions = legalAllowedCurrencies;
            }
        } else {
            canUpgrade = false;
        }
        return {
            typeOfNextAccount,
            canUpgrade,
            currencyOptions,
            allowedMarkets,
            multi
        };
    };

    api.getPortfolio();
    api.getStatement({ description: 1, limit: 20 });
    api.getAccountSettings().then(msg => {
      store.dispatch({ type: UPDATE_SETTINGS_FIELD, settings: msg });
      if (msg.get_settings.country_code) {
            api.getPaymentAgentsForCountry(msg.get_settings.country_code);
            api.getStatesForCountry(msg.get_settings.country_code).then(message => {
              store.dispatch({ type: SERVER_DATA_STATES, states: message.states_list });
            });
            api.getLandingCompany(msg.get_settings.country_code).then(message => {
              const landingCompany = message.landing_company;
              store.dispatch(actions.updateLandingCompany(landingCompany));
              const upgradeableLandingCompanies = authData.authorize.upgradeable_landing_companies;
              const currentLandingCompany = authData.authorize.landing_company_name;
              const loginid = authData.authorize.loginid;
              const accounts = state.boot.get('accounts').toJS();
              const currencyConfig = state.account.get('currencies_config').toJS();
              const upgradeInfo = getUpgradeInfo(landingCompany, upgradeableLandingCompanies, currentLandingCompany, accounts, currencyConfig);
              const availableCurrencies = populateCurrencyOptions(loginid, accounts, landingCompany, currencyConfig);
              const defaultCurrency = !/VRTC/i.test(loginid) ?
                  landingCompanyValue(loginid, 'legal_default_currency', landingCompany) : 'USD';
              store.dispatch({ type: SET_DEFAULT_CURRENCY, default_currency: defaultCurrency });
              store.dispatch({ type: SET_AVAILABLE_CURRENCIES, available_currencies: availableCurrencies });
              store.dispatch({ type: UPDATE_UPGRADE_INFO, upgradeInfo });
            });
        }
    });
    api.getPayoutCurrencies();
    api.subscribeToBalance();
    api.subscribeToAllOpenContracts();
    api.subscribeToTransactions();
    // subscribeToSelectedSymbol(store);

    if (authData.authorize.is_virtual !== 1) {
        api.getAccountLimits();
        api.getSelfExclusion();
        api.getCashierLockStatus();
    }
};

export const trackSymbols = symbols => {
    api.unsubscribeFromAllTicks();
    api.subscribeToTicks(symbols);
};

export const setAccountCurrency = (currency, store, onCurrencyAdded) => {
  const state = store.getState();
  api.setAccountCurrency(currency).then(r => {
      if (r.set_account_currency === 1) {
        const loginid = state.account.toJS().loginid;
        addCurrencyToAccount(currency, loginid);
        if (onCurrencyAdded) {
          onCurrencyAdded();
        }
      }
    }
  );
};

export const setSelfExclusionData = (selfExclusion) => {
    api.setSelfExclusion(selfExclusion).then(s => {
        if (s.set_self_exclusion === 1) {
            api.getAccountLimits();
            api.getSelfExclusion();
        }
    });
};

export const connect = async store => {
    Object.keys(handlers).forEach(key => {
        const action = actions[handlers[key]];

        api.events.on(key, data => store.dispatch(action(data)));
        // api.events.on(key, (data) => console.warn(key, data));
    });
    api.getResidences();
    api.getWebsiteStatus().then(status => {
        const supportedLanguages = status.website_status.supported_languages;
        let appLanguages = [];
        if (supportedLanguages && supportedLanguages.length) {
            languages.forEach(l => {
                if (supportedLanguages.indexOf(l.value) > -1) {
                    appLanguages.push(l);
                }
            });
        } else {
            appLanguages = [{
                value: 'EN',
                text: 'English',
            }];
        }

        store.dispatch({ type: UPDATE_SUPPORTED_LANGUAGES, languages: appLanguages });
    });
    api.events.on('authorize', response => response.error ? null : initAuthorized(response, store));
};
