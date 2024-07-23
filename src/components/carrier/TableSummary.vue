<template>
  <div class="row items-center justify-center">
    <div class="col-12 q-mt-md">
      <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
        <div class="row q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6">
            <q-input
      dense
      outlined stack-label v-model="item.code" type="text" label="Código" class="q-mt-md" />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-select dense outlined  class="q-mt-md" v-model="item.name" label="Tipo de Tabela" :options="tableNames"
              :rules="[isInvalid('name')]" />
          </div>

          <div class="col-xs-12 col-sm-4">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask v-model="item.maxHeight" sufix="m" type="text"
              label="Altura máxima" class="q-mt-md" :rules="[isInvalid('float')]" mask="#,##" fill-mask="0" />
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask v-model="item.maxWidth" sufix="m" type="text"
              label="Largura máxima" class="q-mt-md" :rules="[isInvalid('float')]" mask="#,##" fill-mask="0" />
          </div>
          <div class="col-xs-12 col-sm-4">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask v-model="item.maxDepth" sufix="m" type="text"
              label="Comprimento máximo" class="q-mt-md" :rules="[isInvalid('float')]" mask="#,##" fill-mask="0" />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask v-model="item.minCubage" sufix="kg" type="text"
              label="Cubagem mínima" class="q-mt-md" :rules="[isInvalid('float')]" mask="#,##" fill-mask="0" />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask v-model="item.maxCubage" sufix="kg" type="text"
              label="Cubagem Máxima" class="q-mt-md" :rules="[isInvalid('float')]" mask="#,##" fill-mask="0" />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-checkbox v-model="item.marketplace" label="Marketplace" class="q-mt-md" />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-checkbox v-model="item.website" label="Cota fácil" class="q-mt-md" />
          </div>
        </div>

        <div class="row justify-end">
          <q-btn :loading="saving" type="submit" icon="save" label="Salvar" size="md" color="primary" class="q-mt-md" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>

import { api } from "app/modules/controleonline/ui-common/src/api";
import SubmissionError from "@controleonline/ui-common/src/error/SubmissionError";
import { mapGetters } from "vuex";

export default {
  props: {
    table: {
      required: true,
    },

  },

  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
    item() {
      return this.table || {};
    },
  },
  data() {
    return {
      saving: false,
      tableNames: [
        'BALCAO',
        'FRACIONADO',
        'FRACIONADO / AEREO',
        'FRACIONADO / EXPRESSO',
        'LOTACAO / GERAL',
        'LOTACAO / GRANEL LIQUIDO',
        'LOTACAO / GRANEL SOLIDO',
        'LOTACAO / GRANEL PRESSURIZADA',
        'LOTACAO / CONTEINERIZADA',
        'LOTACAO / FRIGORIFICADA',
        'LOTACAO / NEOGRANEL',
        'LOTACAO / PERIGOSA GERAL',
        'LOTACAO / PERIGOSA GRANEL SOLIDO',
        'LOTACAO / PERIGOSA GRANEL LIQUIDO',
        'LOTACAO / PERIGOSA FRIGORIFICADA',
        'LOTACAO / PERIGOSA CONTEINERIZADA',
        'MOTO FRETE',
        'VEICULO DEDICADO'
      ],
    };
  },
  watch: {
    defaultCompany(company) {
      this.tableNames =
        company &&
          company.configs &&
          typeof company.configs.groupTableNames != "undefined"
          ? (company.configs.groupTableNames)
          : [];
    },
  },
  methods: {
    // store method
    save(values) {
      let options = {
        method: "PUT",
        
        body: (values),
      };

      let endpoint = `delivery_tax_groups/${this.table.id}`;
      return api.fetch
        (endpoint, options)
        
        .catch((e) => {
          if (e instanceof SubmissionError) throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    onSubmit() {
      this.saving = true;

      this.save({
        code:
          this.item.code === null || !this.item.code.length
            ? null
            : this.item.code,
        groupName: this.item.name,
        maxHeight: parseFloat(this.item.maxHeight.replace(",", ".")),
        maxWidth: parseFloat(this.item.maxWidth.replace(",", ".")),
        maxDepth: parseFloat(this.item.maxDepth.replace(",", ".")),
        maxCubage: parseFloat(this.item.maxCubage.replace(",", ".")),
        minCubage: parseFloat(this.item.minCubage.replace(",", ".")),
        marketplace: this.item.marketplace,
        website: this.item.website,
      })
        .then((data) => {
          if (data) {
            this.$emit("saved", this.item);
          }
        })
        .catch((error) => {
          this.$emit("error", { message: error.message });
        })
        .finally(() => {
          this.saving = false;
        });
    },

    isInvalid(key) {
      return (val) => {
        if (!(val && val.length > 0)) return this.$t("messages.fieldRequired");

        return true;
      };
    },
  },
};
</script>
