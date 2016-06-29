import React, { PropTypes, Component } from 'react';
import Resizer from 'binary-components/lib/Resizer';
import TradesContainer from '../trades/TradesContainer';
import WorkspaceSidePanel from './WorkspaceSidePanel';
import Tab from 'binary-components/lib/Tab';
import TabList from 'binary-components/lib/TabList';
import ContractDetailsModal from './ContractDetailsModal';

export default class WorkspaceCard extends Component {

	static propTypes = {
		actions: PropTypes.object.isRequired,
		workspace: PropTypes.object.isRequired,
	};

	onResize = e => {
		const { actions } = this.props;
		actions.changeWorkspacePanelSize('right', window.innerWidth - e.clientX - 92);
	}

	onTabChange = idx => {
		const { actions } = this.props;
		actions.changeActiveWorkspaceTab('right', idx);
	}

	render() {
		const { actions, workspace } = this.props;

		return (
			<div className="panels">
				<ContractDetailsModal actions={actions} />
				<TradesContainer
					actions={actions}
					tradeMode={workspace.tradeMode}
				/>
				<Resizer
					className="resizer-vertical"
					onResize={this.onResize}
				/>
				{workspace.rightPanelVisible &&
					<WorkspaceSidePanel {...this.props} />}
				<TabList
					id="right-tab-list"
					className="inverse"
					vertical
					activeIndex={workspace.rightActiveTab}
					showText
					onChange={this.onTabChange}
				>
					<Tab imgSrc="img/portfolio.svg" text="Portfolio" />
					<Tab imgSrc="img/statement.svg" text="Statement" />
					<Tab imgSrc="img/watchlist.svg" text="Watchlist" />
					<Tab imgSrc="img/time.svg" text="Trading Times" />
					<Tab imgSrc="img/resources.svg" text="Asset Index" />
					<Tab imgSrc="img/video.svg" text="Video" />
					<Tab imgSrc="img/news.svg" text="News" />
					<Tab imgSrc="img/ohlc.svg" text="Daily Prices" />
					<Tab imgSrc="img/info.svg" text="Details" />
					<Tab imgSrc="img/barchart.svg" text="Digit Stats" />
					<Tab imgSrc="img/settings.svg" text="Settings" />
				</TabList>
			</div>
		);
	}
}
