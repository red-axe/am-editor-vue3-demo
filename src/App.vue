<template>
  <router-view />
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 15px;

  a {
    font-weight: bold;
    color: #2c3e50;
    padding: 0 15px;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
  a:frist-child {
    padding-left: 0;
  }
}
</style>
