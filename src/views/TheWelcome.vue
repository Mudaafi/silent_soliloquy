<script setup lang="ts">
import WelcomeItem from '../components/WelcomeItem.vue'
import DocumentationIcon from '../components/icons/IconDocumentation.vue'
import ToolingIcon from '../components/icons/IconTooling.vue'
import EcosystemIcon from '../components/icons/IconEcosystem.vue'
import CommunityIcon from '../components/icons/IconCommunity.vue'
import SupportIcon from '../components/icons/IconSupport.vue'
import HelloWorld from '../components/HelloWorld.vue'
</script>

<template>
  <div class="container">
    <header>
      <img
        alt="Vue logo"
        class="logo"
        src="@/assets/logo.svg"
        width="125"
        height="125"
      />

      <div class="wrapper">
        <HelloWorld msg="You did it!" />
      </div>
    </header>
    <div class="welcome-container">
      <WelcomeItem>
        <template #icon>
          <DocumentationIcon />
        </template>
        <template #heading>Documentation</template>

        Vue’s
        <a target="_blank" href="https://vuejs.org/">official documentation</a>
        provides you with all information you need to get started.
      </WelcomeItem>

      <WelcomeItem>
        <template #icon>
          <ToolingIcon />
        </template>
        <template #heading>Tooling</template>

        This project is served and bundled with
        <a href="https://vitejs.dev/guide/features.html" target="_blank">Vite</a
        >. The recommended IDE setup is
        <a href="https://code.visualstudio.com/" target="_blank">VSCode</a> +
        <a href="https://github.com/johnsoncodehk/volar" target="_blank"
          >Volar</a
        >. If you need to test your components and web pages, check out
        <a href="https://www.cypress.io/" target="_blank">Cypress</a> and
        <a href="https://on.cypress.io/component" target="_blank"
          >Cypress Component Testing</a
        >.

        <br />

        More instructions are available in <code>README.md</code>.
      </WelcomeItem>

      <WelcomeItem>
        <template #icon>
          <EcosystemIcon />
        </template>
        <template #heading>Ecosystem</template>

        Get official tools and libraries for your project:
        <a target="_blank" href="https://pinia.vuejs.org/">Pinia</a>,
        <a target="_blank" href="https://router.vuejs.org/">Vue Router</a>,
        <a target="_blank" href="https://test-utils.vuejs.org/"
          >Vue Test Utils</a
        >, and
        <a target="_blank" href="https://github.com/vuejs/devtools"
          >Vue Dev Tools</a
        >. If you need more resources, we suggest paying
        <a target="_blank" href="https://github.com/vuejs/awesome-vue"
          >Awesome Vue</a
        >
        a visit.
      </WelcomeItem>

      <WelcomeItem>
        <template #icon>
          <CommunityIcon />
        </template>
        <template #heading>Community</template>

        Got stuck? Ask your question on
        <a target="_blank" href="https://chat.vuejs.org">Vue Land</a>, our
        official Discord server, or
        <a
          target="_blank"
          href="https://stackoverflow.com/questions/tagged/vue.js"
          >StackOverflow</a
        >. You should also subscribe to
        <a target="_blank" href="https://news.vuejs.org">our mailing list</a>
        and follow the official
        <a target="_blank" href="https://twitter.com/vuejs">@vuejs</a>
        twitter account for latest news in the Vue world.
      </WelcomeItem>

      <WelcomeItem>
        <template #icon>
          <SupportIcon />
        </template>
        <template #heading>Support Vue</template>

        As an independent project, Vue relies on community backing for its
        sustainability. You can help us by
        <a target="_blank" href="https://vuejs.org/sponsor/"
          >becoming a sponsor</a
        >.
      </WelcomeItem>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.welcome-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
