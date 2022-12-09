import { html, css, LitElement } from 'lit';
import "@lrnwebcomponents/es-global-bridge/es-global-bridge.js";

export class KeycloakLogin extends LitElement {
  static get tag() {
    return 'keycloak-login';
  }
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--key-cloak-popup-text-color, #000);
      }
    `;
  }

  static get properties() {
    return {
      jwt: { type: String },
      email: { type: String },
      refreshToken: { type: String },
      tokenParsed: { type: Object },
      isLoggedIn: { type: Boolean},
      location: { type: String },
      clientId: { type: String },
      realm: { type: String },
    };
  }

  constructor() {
    super();
    this.email = null;
    this.isLoggedIn = false;
    this.jwt = null;
    this.refreshToken = null;
    this.tokenParsed = {};
    this.location = '/';
    this.clientId = '';
    this.realm = '';

    setTimeout(async () => {
      await window.ESGlobalBridge.requestAvailability().load("keycloak", this.location + "/js/keycloak.js");      
      this.keycloak = new Keycloak({
        url: this.location,
        realm: this.realm,
        clientId: this.clientId,
      });
      await this.keycloak.init(
        {onLoad: 'check-sso',
          silentCheckSsoRedirectUri: import.meta.url + '/../check-sso.html'}).then((authenticated) => {
        this.isLoggedIn = authenticated;
      }).catch(function(e) {
        console.log(e);
      });
    }, 0);
  }

  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (this.keycloak && propName === 'isLoggedIn' && this[propName]) {
        this.jwt = this.keycloak.idToken;
        this.refreshToken = this.keycloak.refreshToken;
        this.tokenParsed = this.keycloak.tokenParsed;
      }
      if (this.keycloak && propName === 'tokenParsed' && this[propName]) {
        this.email = this.tokenParsed.email;
        console.log(this.tokenParsed);
        console.log(this.keycloak.createLoginUrl());
      }
    })
  }

  openWindow() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=300,height=500,right=500,top=200`;
    this._popup = window.open(import.meta.url + '/../popup.html', 'popup', params);
    window.addEventListener('message', this.processData.bind(this), false);
  }

  async processData(e) {
    if (e.data) {
      if (e.data.refreshToken) {
        this.jwt = e.data.idToken;
        this.refreshToken = e.data.refreshToken;
        this.tokenParsed = e.data.tokenParsed;
        this.isLoggedIn = true;
        this._popup.close();
      }
    }
  }

  render() {
    return html`
    ${this.isLoggedIn ? html`Hello ${this.tokenParsed.given_name ? this.tokenParsed.given_name : ''} ${this.tokenParsed.family_name ? this.tokenParsed.family_name : ''} ${this.email}` : html`<button @click="${this.openWindow}">Click to login</button>
`}
    `;
  }
}

customElements.define(KeycloakLogin.tag, KeycloakLogin);