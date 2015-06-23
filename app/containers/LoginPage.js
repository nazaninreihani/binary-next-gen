import React from "react";
import { Link } from "react-router";
import { Sparklines, SparklinesLine } from 'react-sparklines';

export default class LoginPage extends React.Component {
	static getProps() {
		return {};
	}
	render() {
		return <div>
			<p>
                <img className="form-logo" src="/images/pages/binary-symbol-logo.svg"/>
            </p>
            <h3>Sign in to your account</h3>
            <p className="errorfield bigerror">
                Binary.com now requires your email and password to log in. If you have both a real-money and a virtual-money account, please use the password from your real-money account.
            </p>
            <p>
                <a href="/user/logintrouble">Login Trouble?</a>
            </p>
            <p>
                <input name="email" placeholder="Email" type="email"></input>
            </p>
		  	<p>
		    	<input name="password" placeholder="Password" type="password"></input>
		  	</p>
		    <p className="errorfield">password</p>
		  	<p>
				<button>Sign in</button>
		  	</p>
		  	<p>
		    	<a className="pjaxload" href="<%= url_for('/user/lost_password') %>">Forgot password?</a>
		  	</p>
		  	<p>
		    	<a className="pjaxload" href="<%= url_for('/') %>">Open an Account</a>
		  	</p>
		</div>;
	}
}