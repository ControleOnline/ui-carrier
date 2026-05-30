<!-- Contract imported from AGENTS.md
## Escopo
- Modulo de transportadoras, tabelas de frete e regras operacionais ligadas a carrier.
- A implementacao encontrada aqui hoje esta em Vue legado.

## Estado
- Este modulo hoje nao tem `src/react`; a implementacao disponivel fica em `src/vue`.
- Em novos prompts, priorizar modulos React equivalentes quando existirem.
- So mexer em `src/vue` se o pedido for explicitamente sobre este fluxo ou se nao houver alternativa atual.

## Quando usar
- Prompts sobre carrier, transportadora, tabela de frete, tax region e telas antigas de expedicao.
-->

<template>
  <People :context="context" :myCompany="myCompany" v-if="context" />
</template>

<script>
import People from "@controleonline/ui-people/src/vue/components/People/List.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    People,
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
    }),
  },
  data() {
    return {
      context: "carrier",
    };
  },
  created() {},
};
</script>
