<template>
  <div class="row">
    <div class="col-12 q-mt-md">
      <q-table dense 
        :rows           ="items"
        :columns        ="settings.columns"
        :visible-columns="settings.visibleColumns"
        row-key         ="id"
        :loading        ="isLoading"
        v-model:pagination="pagination"
        @request        ="onRequest"
      >
        <template v-slot:top>
          <div class="col-3 q-mb-md text-h6">
            Lista de praças
          </div>
          <div class="col-9 q-mb-md">
            <div class="row justify-end">
              <q-btn
                label ="Adicionar"
                icon  ="add"
                size  ="md"
                color ="primary"
                class ="q-ml-sm"
                @click="dialog = !dialog"
              />
            </div>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              <q-btn outline dense
                :to   ="{ name: 'CarrierRegionDetails', params: { id: id, regionId: props.row.id }}"
                :label="`#${props.row.id}`"
                class ="full-width"
              />
            </q-td>
            <q-td key="name"     :props="props">{{ props.row.name      }}</q-td>
            <q-td key="cities"   :props="props">
              <div v-html="props.cols[2].value"></div>
            </q-td>
            <q-td key="deadline" :props="props">{{ props.cols[3].value }}</q-td>
            <q-td key="tax"      :props="props">{{ props.cols[4].value }}</q-td>
            <q-td auto-width>
              <q-btn flat round dense
                color   ="red"
                icon    ="delete"
                @click  ="removeItem(props.row)"
                :disable="items.length == 1"
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
          <div class="text-h6">Nova praça</div>
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
              v-model  ="item.deadline"
              type     ="text"
              label    ="Prazo"
              class    ="q-mt-md"
              :rules   ="[isInvalid('deadline')]"
              mask     ="#"
              fill-mask="0"
            />
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask
              v-model  ="item.tax"
              prefix   ="R$"
              type     ="text"
              label    ="Taxa de coleta"
              class    ="q-mt-md"
              :rules   ="[isInvalid('money')]"
              mask     ="#,##"
              fill-mask="0"
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

const SETTINGS = {
  visibleColumns: [
    'id'      ,
    'name'    ,
    'cities'  ,
    'deadline',
    'tax'     ,
    'action'  ,
  ],
  columns       : [
    {
      name  : 'id',
      field : 'id',
      align : 'left',
      label : 'ID'
    },
    {
      name : 'name',
      field: row => row.name,
      align: 'left',
      label: 'Nome'
    },
    {
      name  : 'cities',
      field : row => row.cities,
      align : 'left',
      format: (val) => {
        let cities = [];
        if (val.length) {
          val.forEach((item, i) => {
            cities.push(`${item.city} / ${item.state}`);
          });
        }
        return cities.join('<br>');
      },
      label : 'Cidades'
    },
    {
      name  : 'deadline',
      field : row => row.deadline,
      align : 'left',
      format: (val) => {
        return val > 1 ? `${val} dias` : `${val} dia`;
      },
      label : 'Prazo'
    },
    {
      name  : 'tax',
      field : row => row.tax,
      align : 'left',
      format: (val) => {
        return this.$formatter. formatMoney(val, 'BRL', 'pt-BR');
      },
      label : 'Taxa de coleta'
    },
    { name: 'action' },
  ],
};

Object.freeze(SETTINGS);

export default {
  props: {
    id: {
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
        name    : null,
        deadline: null,
        tax     : null,
        cities  : null
      },
      pagination: {
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
      let endpoint = `carriers/${this.id}/regions`;
      return api.fetch(endpoint, { params })
        
        .then(result => {
          return result.response.data;
        });
    },

    // store method
    create(values) {
      let options = {
        method : 'PUT',
       
        body   : (values),
      };

      let endpoint = `carriers/${this.id}/regions`;
      return api.fetch(endpoint, options)
        
        .then(data => {
          if (data.response) {
            if (data.response.success === false)
              throw new Error(data.response.error);

            return data.response.data;
          }

          return null;
        });
    },

    // store method
    delete(id) {
      let options = {
        method : 'DELETE',
       
        body   : ({ id }),
      };

      let endpoint = `carriers/${this.id}/regions`;
      return api.fetch(endpoint, options)
        
        .then(data => {
          if (data.response) {
            if (data.response.success === false)
              throw new Error(data.response.error);

            return data.response.data;
          }

          return null;
        });
    },

    onSubmit() {
      this.$refs.myForm.validate()
        .then(success => {
          if (success) {
            this.saving = true;

            this.create({
              "regionName": this.item.name,
              "deadline"  : parseInt(this.item.deadline),
              "taxValue"  : parseFloat(this.item.tax.replace(',', '.')),
            })
              .then (data => {
                if (data) {
                  this.$refs.myForm.reset();

                  this.$emit('saved', data);
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
      let params = { limit: rowsPerPage, page };

      this.isLoading = true;

      this.getItems(params)
        .then(data => {
          let _items = [];

          if (data.members.length) {
            for (let index in data.members) {
              _items.push({
                id      : data.members[index].id,
                name    : data.members[index].name,
                deadline: data.members[index].deadline,
                tax     : data.members[index].tax,
                cities  : data.members[index].cities,
                _bussy  : false,
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
