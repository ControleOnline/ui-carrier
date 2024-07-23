<template>
  <div class="row">
    <div class="col-12 q-mt-md">
      <q-table dense 
        :rows           ="items"
        :columns        ="settings.columns"
        row-key         ="id"
        :loading        ="isLoading"
        v-model:pagination="pagination"
        @request        ="onRequest"
      >
        <template v-slot:top>
          <div class="col-12 q-mb-md">
            <div class="row justify-end">
              <q-btn
                label ="Adicionar"
                icon  ="add"
                size  ="md"
                color ="primary"
                class ="q-ml-sm"
                @click="() => {
                  prepareItemForm(null);
                  dialog = !dialog;
                }"
              />
            </div>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              <q-btn outline dense
                :label="`#${props.row.id}`"
                class ="full-width"
                @click="prepareItemForm(props.row)"
              />
            </q-td>
            <q-td key="taxName"      :props="props">{{ props.row.taxName   }}</q-td>
            <q-td key="finalWeight"  :props="props">{{ props.cols[2].value }}</q-td>
            <q-td key="price"        :props="props">{{ props.cols[3].value }}</q-td>
            <q-td key="minimumPrice" :props="props">{{ props.cols[4].value }}</q-td>
            <q-td key="type"         :props="props">{{ props.cols[5].value }}</q-td>
            <q-td key="subType"      :props="props">{{ props.cols[6].value }}</q-td>
            <q-td key="optional"     :props="props">{{ props.cols[7].value }}</q-td>
            <q-td auto-width>
              <q-btn flat round dense
                color   ="red"
                icon    ="delete"
                @click  ="removeItem(props.row)"
                :loading="props.row._bussy"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ item.id !== null ? `Editar taxa #${item.id}` : 'Nova taxa' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form ref="myForm" @submit="onSubmit" class="q-mt-md">
            <q-input
      dense
      outlined lazy-rules stack-label
              v-model="item.name"
              type   ="text"
              label  ="Nome"
              class  ="q-mt-md"
              :rules ="[isInvalid('name')]"
            />
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask
              v-model  ="item.finalWeight"
              suffix   ="kg"
              type     ="text"
              label    ="Peso final"
              class    ="q-mt-md"
              :rules   ="[isInvalid('float')]"
              mask     ="#,##"
              fill-mask="0"
            />
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask
              v-model  ="item.price"
              prefix   ="R$"
              type     ="text"
              label    ="Preço"
              class    ="q-mt-md"
              :rules   ="[isInvalid('float')]"
              mask     ="#,##"
              fill-mask="0"
            />
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask
              v-model  ="item.minimumPrice"
              type     ="text"
              label    ="Fração por KG"
              class    ="q-mt-md"
              :rules   ="[isInvalid('float')]"
              mask     ="#,##"
              fill-mask="0"
            />
            <q-checkbox
              v-model="item.optional"
              label  ="Opcional"
              class  ="q-mt-md"
            />

            <div class="row justify-end">
              <q-btn
                :loading="saving"
                icon    ="save"
                type    ="submit"
                label   ="Salvar"
                size    ="md"
                color   ="primary"
                class   ="q-mt-md"
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
import SubmissionError from '@controleonline/ui-common/src/error/SubmissionError';

const SETTINGS = {
  columns       : [
    {
      name : 'id',
      field: row => row.id,
      align: 'left',
      label: 'ID'
    },
    {
      name : 'taxName',
      field: row => row.taxName,
      align: 'left',
      label: 'Nome'
    },
    {
      name  : 'finalWeight',
      field : 'finalWeight',
      align : 'left',
      format: (val, row) => {
        return val;
      },
      label: 'Peso final'
    },
    {
      name  : 'price',
      field : 'price',
      align : 'left',
      format: (val, row) => {
        return this.$formatter. formatMoney(val, 'BRL', 'pt-br');
      },
      label: 'Preço'
    },
    {
      name  : 'minimumPrice',
      field : 'minimumPrice',
      align : 'left',
      format: (val, row) => {
        return `${val} kg`;
      },
      label: 'Fração por KG'
    },
    {
      name  : 'type',
      field : 'type',
      align : 'left',
      format: (val, row) => {
        return val || '--';
      },
      label: 'Tipo'
    },
    {
      name  : 'subType',
      field : 'subType',
      align : 'left',
      format: (val, row) => {
        return val || '--';
      },
      label: 'Subtipo'
    },
    {
      name  : 'optional',
      field : 'optional',
      align : 'left',
      format: (val, row) => {
        return val ? 'Sim' : 'Não';
      },
      label: 'Opcional'
    },
    { name: 'action' },
  ],
};

Object.freeze(SETTINGS);

export default {
  props: {
    table: {
      required: true,
    },
    
  },

  data() {
    return {
      items    : [],
      dialog   : false,
      settings : SETTINGS,
      saving   : false,
      isLoading: false,
      item     : {
        id          : null,
        name        : null,
        finalWeight : null,
        price       : null,
        minimumPrice: null,
        optional    : false,
      },
      pagination: {
        sortBy     : 'name',
        descending : false,
        page       : 1,
        rowsPerPage: 10,
        rowsNumber : 10,
      },
    };
  },

  created() {
    this.onRequest({
      pagination: this.pagination
    });
  },

  methods: {
    // store method
    getItems(params) {
      const endpoint = `delivery_tax_groups/${this.table.id}/delivery_taxes`;
      return api.fetch(endpoint, { params })
        
        .then(result => {
          return {
            members: result['hydra:member'],
            total  : result['hydra:totalItems'],
          };
        });
    },

    // store method
    save(values) {
      const options = {
        method : this.item.id === null ? 'POST' : 'PUT',
       
        body   : (values),
      };

      const endpoint = options.method == 'PUT' ? `delivery_taxes/${this.item.id}` : 'delivery_taxes';

      return api.fetch(endpoint, options)
        
        .catch(e => {
          if (e instanceof SubmissionError)
            throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    // store method
    delete(id) {
      let options = {
        method: 'DELETE',
      };

      let endpoint = `delivery_taxes/${id}`;
      return api.fetch(endpoint, options)
        .catch(e => {
          if (e instanceof SubmissionError)
            throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    prepareItemForm(values) {
      this.item.id           = values !== null ? values.id : null;
      this.item.name         = values !== null ? values.taxName : null;
      this.item.finalWeight  = values !== null ? (parseFloat(values.finalWeight) + 0.001).toFixed(2) : null;
      this.item.price        = values !== null ? (parseFloat(values.price) + 0.001).toFixed(2) : null;
      this.item.minimumPrice = values !== null ? (parseFloat(values.minimumPrice) + 0.001).toFixed(2) : null;
      this.item.optional     = values !== null ? values.optional : false;

      if (values !== null) {
        this.dialog = true;
      }
    },

    onSubmit() {
      this.$refs.myForm.validate()
        .then(success => {
          if (success) {
            this.saving = true;

            let payload = {};
            // POST
            if (this.item.id === null) {
              payload = {
              	"taxName"     : this.item.name,
              	"taxType"     : "fixed",
                "taxSubtype"  : "kg",
                "price"       : parseFloat(this.item.price.replace(',', '.')),
              	"minimumPrice": parseFloat(this.item.minimumPrice.replace(',', '.')),
              	"finalWeight" : parseFloat(this.item.finalWeight.replace(',', '.')),
              	"groupTax"    : `/delivery_tax_groups/${this.table.id}`,
              	"taxOrder"    : 0,
              	"optional"    : this.item.optional
              };
            }
            // PUT
            else {
              payload = {
              	"taxName"     : this.item.name,
                "price"       : parseFloat(this.item.price.replace(',', '.')),
              	"minimumPrice": parseFloat(this.item.minimumPrice.replace(',', '.')),
                "finalWeight" : parseFloat(this.item.finalWeight.replace(',', '.')),
              	"optional"    : this.item.optional
              };
            }

            this.save(payload)
              .then(data => {
                if (data) {
                  this.$refs.myForm.reset();

                  this.onRequest({
                    pagination: this.pagination
                  });

                  this.$emit('saved', data);

                  if (data.id) {
                    this.item.id = data.id;
                  }
                }
              })
              .catch(error => {
                this.$refs.myForm.reset();

                this.$emit('error', { message: error.message });
              })
              .finally(() => {
                this.saving = false;
              });
          }
      })
    },

    removeItem(item) {
      if (window.confirm('Tem certeza que deseja eliminar este registro?')) {
        item._bussy = true;

        this.delete(item.id)
        .then (data => {
          if (data) {
            this.cleanItem(item.id);

            this.$emit('removed', item.id);
          }
        })
        .catch(error => {
          this.$emit('error', { message: error.message });
        })
        .finally(() => {
          item._bussy = false;
        });
      }
    },

    cleanItem(id) {
      let item   = this.items.find(obj => obj['id'] == id);
      let indx   = this.items.indexOf(item);
      this.items = [...this.items.slice(0, indx), ...this.items.slice(indx + 1)];
    },

    onRequest(props) {
      if (this.isLoading)
        return;

      let {
          page,
          rowsPerPage,
          rowsNumber,
          sortBy,
          descending
      }          = props.pagination;
      let params = { itemsPerPage: rowsPerPage, page };

      params['taxType']                   = 'fixed';
      params['taxSubtype']                = 'kg';
      params['exists[regionOrigin]']      = false;
      params['exists[regionDestination]'] = false;

      this.isLoading = true;

      this.getItems(params)
        .then(data => {
          let _items = [];

          if (data.members.length) {
            for (let index in data.members) {
              _items.push({
                id          : data.members[index].id,
                taxName     : data.members[index].taxName,
                price       : data.members[index].price,
                minimumPrice: data.members[index].minimumPrice,
                finalWeight : data.members[index].finalWeight,
                type        : data.members[index].taxType,
                subType     : data.members[index].taxSubtype,
                optional    : data.members[index].optional,
                _bussy      : false,
              });
            }
          }

          this.items                  = _items;
          this.pagination.page        = page;
          this.pagination.rowsPerPage = rowsPerPage;
          this.pagination.sortBy      = sortBy;
          this.pagination.descending  = descending;
          this.pagination.rowsNumber  = data.total;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    isInvalid(key) {
      return val => {
        if (!(val && val.length > 0))
          return 'Este campo é obrigatório';

        return true;
      };
    },
  },
};
</script>
