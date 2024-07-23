<template>
  <q-form ref="myForm" @submit="onSubmit" class="q-mt-md">
    <div v-for="(tax, index) in taxes" :key="index" class="row">
      <div class="col-xs-12 col-sm-11">
        <div class="row q-gutter-sm">
          <div class="col-xs-12 col-sm-2">
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              label="Taxa"
              v-model="tax.taxName"
              type="text"
              class="q-mt-md"
              :rules="[isInvalid('name')]"
            />
          </div>
          <div class="col-xs-12 col-sm-2">
            <q-select
              dense
              outlined
              stack-label
              emit-value
              map-options
              label="Tipo"
              v-model="tax.taxType"
              class="q-mt-md"
              :options="taxesType"
              :rules="[(val) => val !== null || 'Selecione um tipo']"
            />
          </div>
          <div class="col-xs-12 col-sm-2">
            <q-select
              dense
              outlined
              stack-label
              emit-value
              map-options
              label="Praça de coleta"
              v-model="tax.origin"
              class="q-mt-md"
              :options="origins"
              :rules="[(val) => val !== null || 'Selecione uma praça']"
            />
          </div>
          <div class="col-xs-12 col-sm-2">
            <q-select
              dense
              outlined
              stack-label
              emit-value
              map-options
              label="Praça de entrega"
              v-model="tax.destination"
              class="q-mt-md"
              :options="dests"
              :rules="[(val) => val !== null || 'Selecione uma praça']"
            />
          </div>
          <div class="col-xs-12 col-sm-1">
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="tax.finalWeight"
              suffix="kg"
              type="text"
              label="Peso final"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
          </div>
          <div class="col-xs-12 col-sm-1">
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="tax.price"
              prefix="R$"
              type="text"
              label="Valor taxa"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
          </div>
          <div class="col-xs-12 col-sm-1">
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="tax.minimumPrice"
              type="text"
              label="Taxa mínima"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-sm-1">
        <div class="row justify-end items-center full-height">
          <div class="col-xs-12 col-sm-5">
            <q-btn
              flat
              round
              v-if="index == 0"
              icon="delete"
              color="red"
              :disable="true"
              :loading="tax._saving"
            />
            <q-btn
              flat
              round
              v-else
              icon="delete"
              color="red"
              @click="removeTax(index)"
              :loading="tax._saving"
            />
          </div>
          <div class="col-xs-12 col-sm-5">
            <q-btn
              flat
              round
              v-if="index == taxes.length - 1"
              icon="add_circle"
              size="md"
              color="green"
              @click="addTax"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-end">
      <q-btn
        :loading="saving"
        icon="save"
        type="submit"
        label="Salvar todas"
        size="md"
        color="primary"
        class="q-mt-md"
      />
    </div>
  </q-form>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import SubmissionError from "@controleonline/ui-common/src/error/SubmissionError";
import { extend } from "quasar";

export default {
  props: {
    table: {
      required: true,
    },
  },

  data() {
    return {
      saving: false,
      taxes: [
        {
          taxName: null,
          taxType: null,
          origin: null,
          destination: null,
          finalWeight: null,
          price: null,
          minimumPrice: null,
          optional: false,
          _saving: false,
        },
      ],
      origins: [],
      dests: [],
      taxesType: [],
    };
  },

  created() {
    this.loadTableTaxesType();
    this.loadCarrierRegions();
  },

  methods: {
    // store method
    save(values) {
      const options = {
        method: "POST",
        
        body: (values),
      };

      return api.fetch("delivery_taxes", options)
      .catch((e) => {
        if (e instanceof SubmissionError) throw new Error(e.errors._error);

        throw new Error(e.message);
      });
    },

    // store method
    getCarrierRegions() {
      const endpoint = `carriers/${this.table.carrier}/regions`;
      return api.fetch(endpoint, { params: { limit: 1000 } })
      .then((result) => {
        return result.response.data;
      });
    },

    // store method
    getTableTaxesType() {
      /*
      const endpoint = `delivery_taxes/tax-types`;
      return api.fetch(endpoint)
        
        .then(result => {
          return result.response.data;
        });
      */

      const data = {
        members: [],
      };

      data.members.push({
        name: "Tabela",
        value: {
          type: "fixed",
          subtype: null,
        },
      });

      data.members.push({
        name: "Porcentagem da fatura",
        value: {
          type: "percentage",
          subtype: "invoice",
        },
      });

      data.members.push({
        name: "Porcentagem do frete",
        value: {
          type: "percentage",
          subtype: "order",
        },
      });

      data.members.push({
        name: "KG por praça",
        value: {
          type: "fixed",
          subtype: "kg",
        },
      });

      data.members.push({
        name: "Fixa por distancia",
        value: {
          type: "fixed",
          subtype: "km",
        },
      });

      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(data);
        }, 500);
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

    loadTableTaxesType() {
      if (!this.taxesType.length) {
        this.getTableTaxesType().then((taxes) => {
          if (taxes.members.length) {
            let _taxes = [];

            taxes.members.forEach((tax, i) => {
              _taxes.push({
                label: tax.name,
                value: tax.value,
              });
            });

            this.taxesType = _taxes;
          }
        });
      }
    },

    onSubmit() {
      this.$refs.myForm.validate().then((success) => {
        async function asyncForEach(array, callback) {
          for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
          }
        }

        // save all taxes one by one

        (async () => {
          await asyncForEach(this.taxes, async (tax) => {
            tax._saving = true;

            await this.save({
              taxName: tax.taxName,
              taxType: tax.taxType.type,
              taxSubtype: tax.taxType.subtype,
              regionOrigin: `/delivery_regions/${tax.origin}`,
              regionDestination: `/delivery_regions/${tax.destination}`,
              price: parseFloat(tax.price.replace(",", ".")),
              minimumPrice: parseFloat(tax.minimumPrice.replace(",", ".")),
              finalWeight: parseFloat(tax.finalWeight.replace(",", ".")),
              groupTax: `/delivery_tax_groups/${this.table.id}`,
              taxOrder: 0,
              optional: false,
            })
              .then((data) => {
                if (data) {
                }
              })
              .catch((error) => {
                this.$emit("error", { message: error.message });
              })
              .finally(() => {
                tax._saving = false;
              });
          });
        })()
          .then(() => {
            this.$q.notify({
              message: "Taxas salvas com sucesso",
              position: "bottom",
              type: "positive",
            });
          })
          .catch((error) => {
            this.$q.notify({
              message: error.message,
              position: "bottom",
              type: "negative",
            });
          });
      });
    },

    removeTax(index) {
      this.taxes = [...this.taxes.slice(0, index), ...this.taxes.slice(index + 1)];
    },

    addTax() {
      this.taxes.push(extend(false, this.taxes[this.taxes.length - 1]));
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
