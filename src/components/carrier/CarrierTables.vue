<template>
  <div class="row">
    <div class="col-12 q-mt-md">
      <q-table
        dense
        :rows="items"
        :columns="settings.columns"
        :visible-columns="settings.visibleColumns"
        row-key="id"
        :loading="isLoading"
        v-model:pagination="pagination"
        @request="onRequest"
      >
        <template v-slot:top>
          <div class="col-3 q-mb-md text-h6">Lista de tabelas</div>
          <div class="col-9 q-mb-md">
            <div class="row justify-end">
              <q-btn
                label="Adicionar"
                icon="add"
                size="md"
                color="primary"
                class="q-ml-sm"
                @click="dialog = !dialog"
              />
            </div>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              <q-btn
                outline
                dense
                :to="{
                  name: 'CarrierTableDetails',
                  params: { id: id, tableId: props.row.id },
                }"
                :label="`#${props.row.id}`"
                class="full-width"
              />
            </q-td>
            <q-td key="code" :props="props">{{ props.row.code }}</q-td>
            <q-td key="name" :props="props">{{ props.row.name }}</q-td>
            <q-td key="market" :props="props">
              <q-checkbox
                v-model="props.row.market"
                @update:model-value="
                  (value) => {
                    enableTable('marketplace', props.row.id, value);
                  }
                "
              />
            </q-td>
            <q-td key="website" :props="props">
              <q-checkbox
                v-model="props.row.website"
                @update:model-value="
                  (value) => {
                    enableTable('website', props.row.id, value);
                  }
                "
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Nova tabela</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form ref="myForm" @submit="onSubmit" class="q-mt-md">
            <q-input
              dense
              outlined
              stack-label
              v-model="item.code"
              type="text"
              label="Código"
              class="q-mt-md"
            />

            <q-select
              dense
              outlined
              class="q-mt-md"
              v-model="item.name"
              label="Tipo de Tabela"
              :options="tableNames"
              :rules="[isInvalid('name')]"
            />

            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="item.maxHeight"
              suffix="m"
              type="text"
              label="Altura máxima"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="item.maxWidth"
              suffix="m"
              type="text"
              label="Largura máxima"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="item.maxDepth"
              suffix="m"
              type="text"
              label="Comprimento máximo"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="item.minCubage"
              suffix="kg"
              type="text"
              label="Cubagem mínima"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
            <q-input
              dense
              outlined
              lazy-rules
              stack-label
              reverse-fill-mask
              v-model="item.maxCubage"
              suffix="kg"
              type="text"
              label="Cubagem Máxima"
              class="q-mt-md"
              :rules="[isInvalid('float')]"
              mask="#,##"
              fill-mask="0"
            />
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
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";

import { mapGetters } from "vuex";

const SETTINGS = {
  visibleColumns: ["id", "code", "name", "market", "website"],
  columns: [
    {
      name: "id",
      field: "id",
      align: "left",
      label: "ID",
    },
    {
      name: "code",
      field: (row) => row.code,
      align: "left",
      label: "Código",
    },
    {
      name: "name",
      field: (row) => row.name,
      align: "left",
      label: "Nome",
    },
    {
      name: "market",
      field: (row) => row.market,
      align: "left",
      label: "Marketplace",
    },
    {
      name: "website",
      field: (row) => row.website,
      align: "left",
      label: "Cotafácil",
    },
  ],
};

Object.freeze(SETTINGS);

export default {
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  props: {
    id: {
      required: true,
    },
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
  data() {
    return {
      tableNames: [
        "BALCAO",
        "FRACIONADO",
        "FRACIONADO / AEREO",
        "FRACIONADO / EXPRESSO",
        "LOTACAO / GERAL",
        "LOTACAO / GRANEL LIQUIDO",
        "LOTACAO / GRANEL SOLIDO",
        "LOTACAO / GRANEL PRESSURIZADA",
        "LOTACAO / CONTEINERIZADA",
        "LOTACAO / FRIGORIFICADA",
        "LOTACAO / NEOGRANEL",
        "LOTACAO / PERIGOSA GERAL",
        "LOTACAO / PERIGOSA GRANEL SOLIDO",
        "LOTACAO / PERIGOSA GRANEL LIQUIDO",
        "LOTACAO / PERIGOSA FRIGORIFICADA",
        "LOTACAO / PERIGOSA CONTEINERIZADA",
        "MOTO FRETE",
        "VEICULO DEDICADO",
      ],
      items: [],
      dialog: false,
      settings: SETTINGS,
      saving: false,
      isLoading: false,
      item: {
        code: null,
        name: null,
        maxHeight: null,
        maxWidth: null,
        maxDepth: null,
        maxCubage: null,
        minCubage: null,
      },
      pagination: {
        sortBy: "code",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10,
      },
    };
  },

  created() {
    this.onRequest({
      pagination: this.pagination,
    });
  },

  methods: {
    // store method
    getItems(params) {
      return api.fetch
        ("delivery_tax_groups", { params })

        .then((result) => {
          return {
            members: result["hydra:member"],
            total: result["hydra:totalItems"],
          };
        });
    },

    // store method
    create(values) {
      let options = {
        method: "POST",
        
        body: (values),
      };

      return api.fetch
        ("delivery_tax_groups", options)

        .catch((e) => {
          if (e instanceof Error) throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    // store method
    update(id, values) {
      let options = {
        method: "PUT",
        
        body: (values),
      };

      return api.fetch
        (`delivery_tax_groups/${id}`, options)

        .catch((e) => {
          if (e instanceof Error) throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    // store method
    delete(id) {
      let options = {
        method: "DELETE",
      };

      let endpoint = `delivery_tax_groups/${id}`;
      return api.fetch(endpoint, options).catch((e) => {
        if (e instanceof Error) throw new Error(e.errors._error);

        throw new Error(e.message);
      });
    },

    enableTable(place, id, status) {
      const values = {};
      values[`${place}`] = status;
      this.update(id, values).then((data) => {
        if (data["@id"]) {
          this.$emit("saved", false);
        }
      });
    },

    onSubmit() {
      this.$refs.myForm.validate().then((success) => {
        if (success) {
          this.saving = true;

          this.create({
            carrier: `/people/${this.id}`,
            code: this.item.code,
            groupName: this.item.name,
            maxHeight: parseFloat(this.item.maxHeight.replace(",", ".")),
            maxWidth: parseFloat(this.item.maxWidth.replace(",", ".")),
            maxDepth: parseFloat(this.item.maxDepth.replace(",", ".")),
            minCubage: parseFloat(this.item.minCubage.replace(",", ".")),
            maxCubage: parseFloat(this.item.maxCubage.replace(",", ".")),
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

    removeItem(item) {
      if (window.confirm("Tem certeza que deseja eliminar este registro?")) {
        item._bussy = true;

        this.delete(item.id)
          .then((data) => {
            if (data) {
              this.cleanItem(item.id);
            }
          })
          .catch((error) => {
            this.$emit("error", { message: error.message });
          })
          .finally(() => {
            item._bussy = false;
          });
      }
    },

    cleanItem(id) {
      let item = this.items.find((obj) => obj["id"] == id);
      let indx = this.items.indexOf(item);
      this.items = [...this.items.slice(0, indx), ...this.items.slice(indx + 1)];
    },

    onRequest(props) {
      if (this.isLoading) return;

      let { page, rowsPerPage, rowsNumber, sortBy, descending } = props.pagination;
      let params = { itemsPerPage: rowsPerPage, page };

      params["carrier"] = this.id;

      this.isLoading = true;

      this.getItems(params)
        .then((data) => {
          let _items = [];

          if (data.members.length) {
            for (let index in data.members) {
              _items.push({
                id: data.members[index].id,
                code: data.members[index].code,
                name: data.members[index].groupName,
                market: data.members[index].marketplace,
                website: data.members[index].website,
                _bussy: false,
              });
            }
          }

          this.items = _items;
          this.pagination.page = page;
          this.pagination.rowsPerPage = rowsPerPage;
          this.pagination.sortBy = sortBy;
          this.pagination.descending = descending;
          this.pagination.rowsNumber = data.total;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    isInvalid(key) {
      return (val) => {
        if (!(val && val.length > 0)) return "Este campo é obrigatório";

        return true;
      };
    },
  },
};
</script>
