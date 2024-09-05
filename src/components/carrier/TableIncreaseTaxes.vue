<template>
  <q-form ref="myForm" @submit="onSubmit" class="q-mt-md">
    <q-select dense outlined 
      stack-label
      emit-value
      map-options
      label="Taxa"
      v-model="item.taxName"
      class="q-mt-md"
      :options="taxes"
    />
    <q-select dense outlined 
      stack-label
      emit-value
      map-options
      label="Praça de coleta"
      v-model="item.origin"
      class="q-mt-md"
      :options="origins"
    />
    <q-select dense outlined 
      stack-label
      emit-value
      map-options
      label="Praça de entrega"
      v-model="item.destination"
      class="q-mt-md"
      :options="dests"
    />
    <q-input
      dense
      outlined
      lazy-rules
      stack-label
      reverse-fill-mask
      v-model="item.increase"
      suffix="%"
      type="text"
      step="any"
      label="Incremento"
      class="q-mt-md"
      :rules="[isInvalid('negative')]"
      mask="#,##"
      fill-mask="0"
    />

    <q-checkbox v-model="negative" label="Desconto" />

    <div class="row justify-end">
      <q-btn
        :loading="saving"
        icon="save"
        type="submit"
        label="Salvar"
        size="md"
        color="primary"
        class="q-mt-md"
      />
    </div>
  </q-form>
</template>

<script>

import { api } from "app/modules/controleonline/ui-common/src/api";


export default {
  props: {
    table: {
      required: true,
    },

  },

  data() {
    return {
      negative: false,
      saving: false,
      item: {
        taxName: null,
        increase: null,
        origin: null,
        destination: null,
      },
      origins: [],
      dests: [],
      taxes: [],
    };
  },

  created() {
    this.loadTableTaxes();
    this.loadCarrierRegions();
  },

  methods: {
    // store method
    save(values) {
      let options = {
        method: "PUT",
        
        body: (values),
      };

      let endpoint = `delivery_tax_groups/${this.table.id}/increase-taxes`;
      return api.fetch
        (endpoint, options)
        
        .catch((e) => {
          if (e instanceof Error) throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    // store method
    getCarrierRegions() {
      const endpoint = `carriers/${this.table.carrier}/regions`;
      return api.fetch
        (endpoint, { params: { limit: 1000 } })
        
        .then((result) => {
          return result.response.data;
        });
    },

    // store method
    getTableTaxes() {
      const endpoint = `delivery_tax_groups/${this.table.id}/tax-names`;
      return api.fetch
        (endpoint)
        
        .then((result) => {
          return result.response.data;
        });
    },

    loadCarrierRegions() {
      if (!this.origins.length) {
        this.getCarrierRegions().then((regions) => {
          if (regions.members.length) {
            let _regions = [];

            _regions.push({
              label: "Todas",
              value: null,
            });

            regions.members.forEach((region, i) => {
              _regions.push({
                label: region.name,
                value: region.id,
              });
            });

            this.origins = _regions;
            this.dests = _regions;
          }
        });
      }
    },

    loadTableTaxes() {
      if (!this.taxes.length) {
        this.getTableTaxes().then((taxes) => {
          if (taxes.members.length) {
            let _taxes = [];

            _taxes.push({
              label: "Todas",
              value: null,
            });

            taxes.members.forEach((tax, i) => {
              _taxes.push({
                label: tax,
                value: tax,
              });
            });

            this.taxes = _taxes;
          }
        });
      }
    },

    onSubmit() {
      this.$refs.myForm.validate().then((success) => {
        if (success) {
          this.saving = true;

          let value = parseFloat(this.item.increase.replace(",", "."));
          value = this.negative ? "-" + value : value;

          this.save({
            taxName: this.item.taxName,
            increase: value,
            origin: this.item.origin,
            destination: this.item.destination,
          })
            .then((data) => {
              if (data) {
                this.$refs.myForm.reset();

                this.$emit("saved", data);
              }
            })
            .catch((error) => {
              this.$refs.myForm.reset();

              this.$emit("error", { message: error.message });
            })
            .finally(() => {
              this.saving = false;
            });
        }
      });
    },

    isInvalid(key) {
      return (val) => {
        switch (key) {
          default:
            if (!(val && val.length > 0)) return "Este campo é obrigatório";
        }
        return true;
      };
    },
  },
};
</script>
