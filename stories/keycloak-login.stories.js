import { html } from 'lit';
import '../src/KeycloakLogin.js';

export default {
  title: 'keycloaklogin',
  component: 'keycloak-login',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

function Template({ title, backgroundColor }) {
  return html`
    <keycloak-login
    >
    </keycloak-login>
  `;
}

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
