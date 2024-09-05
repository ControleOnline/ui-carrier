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
                label ="Copiar tabela"
                icon  ="add"
                size  ="md"
                color ="primary"
                class ="q-ml-sm"
                @click="copyDialog = !copyDialog"
              />
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
          <div class="col-12 q-mb-md">
            <div class="row q-col-gutter-xs">
              <div class="col-6 q-mb-md">
                <q-select dense outlined  stack-label emit-value map-options
                  label   ="Praça de coleta"
                  v-model ="filter.origin"
                  class   ="q-mt-md"
                  :options="regions.origin"
                />
              </div>
              <div class="col-6 q-mb-md">
                <q-select dense outlined  stack-label emit-value map-options
                  label   ="Praça de entrega"
                  v-model ="filter.destination"
                  class   ="q-mt-md"
                  :options="regions.destination"
                />
              </div>
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
            <q-td key="taxName"      :props="props">{{ props.row.taxName          }}</q-td>
            <q-td key="origin"       :props="props">{{ props.row.origin.name      }}</q-td>
            <q-td key="destination"  :props="props">{{ props.row.destination.name }}</q-td>
            <q-td key="finalWeight"  :props="props">{{ props.cols[4].value        }}</q-td>
            <q-td key="price"        :props="props">{{ props.cols[5].value        }}</q-td>
            <q-td key="minimumPrice" :props="props">{{ props.cols[6].value        }}</q-td>
            <q-td key="type"         :props="props">{{ props.cols[7].value        }}</q-td>
            <q-td key="subType"      :props="props">{{ props.cols[8].value        }}</q-td>
            <q-td key="optional"     :props="props">{{ props.cols[9].value        }}</q-td>
            <q-td key="deadline"     :props="props">{{ props.cols[10].value       }}</q-td>
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
            <q-select dense outlined  stack-label emit-value map-options
              label   ="Praça de coleta"
              v-model ="item.origin"
              class   ="q-mt-md"
              :options="regions.origin"
              :rules  ="[val => val !== null || 'Selecione uma praça']"
            />
            <q-select dense outlined  stack-label emit-value map-options
              label   ="Praça de entrega"
              v-model ="item.destination"
              class   ="q-mt-md"
              :options="regions.destination"
              :rules  ="[val => val !== null || 'Selecione uma praça']"
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
              label    ="Taxa mínima"
              class    ="q-mt-md"
              :rules   ="[isInvalid('float-not-required')]"
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

    <q-dialog v-model="copyDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Copiar tabela</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form ref="copyForm" @submit="onSubmit2" class="q-mt-md">
            <div class="row">
              <div class="col-4 text-subtitle2" style="display:flex;justify-content:center;align-items:center;">
                Desde a rota
              </div>
              <div class="col-8">
                <div class="row">
                  <div class="col-12">
                    <q-select dense outlined  stack-label emit-value map-options
                      label   ="Praça de coleta"
                      v-model ="copy.fromOrigin"
                      :options="regions.origin"
                      :rules  ="[val => val !== null || 'Selecione uma praça']"
                    />
                  </div>
                  <div class="col-12">
                    <q-select dense outlined  stack-label emit-value map-options
                      label   ="Praça de entrega"
                      v-model ="copy.fromDest"
                      :options="regions.destination"
                      :rules  ="[val => val !== null || 'Selecione uma praça']"
                    />
                  </div>
                </div>
              </div>
            </div>
            <q-separator />
            <div class="row q-mt-md">
              <div class="col-4 text-subtitle2" style="display:flex;justify-content:center;align-items:center;">
                Para a rota
              </div>
              <div class="col-8">
                <div class="row">
                  <div class="col-12">
                    <q-select dense outlined  stack-label emit-value map-options
                      label   ="Praça de coleta"
                      v-model ="copy.toOrigin"
                      :options="regions.origin"
                      :rules  ="[val => val !== null || 'Selecione uma praça']"
                    />
                  </div>
                  <div class="col-12">
                    <q-select dense outlined  stack-label emit-value map-options
                      label   ="Praça de entrega"
                      v-model ="copy.toDest"
                      :options="regions.destination"
                      :rules  ="[val => val !== null || 'Selecione uma praça']"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="row justify-end">
              <q-btn
                :loading="copying"
                icon    ="save"
                type    ="submit"
                label   ="Copiar"
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
      name : 'origin',
      field: row => row.origin,
      align: 'left',
      label: 'Praça de coleta'
    },
    {
      name : 'destination',
      field: row => row.destination,
      align: 'left',
      label: 'Praça de entrega'
    },
    {
      name  : 'finalWeight',
      field : 'finalWeight',
      align : 'left',
      format: (val, row) => {
        return `${val}kg`;
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
        return this.$formatter. formatMoney(val, 'BRL', 'pt-br');
      },
      label: 'Taxa mínima'
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
    {
      name  : 'deadline',
      field : 'deadline',
      align : 'left',
      format: (val, row) => {
        return val > 1 ? `${val} dias` : `${val} dia`;
      },
      label: 'Prazo'
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
      items     : [],
      dialog    : false,
      copyDialog: false,
      settings  : SETTINGS,
      saving    : false,
      copying   : false,
      isLoading : false,
      regions   : {
        origin     : [],
        destination: []
      },
      filter   : {
        origin     : null,
        destination: null
      },
      item     : {
        id          : null,
        name        : null,
        finalWeight : null,
        price       : null,
        origin      : null,
        destination : null,
        minimumPrice: '0,00',
        optional    : false,
      },
      copy     : {
        fromOrigin: null,
        fromDest  : null,
        toOrigin  : null,
        toDest    : null
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

    this.loadCarrierRegions();
  },

  watch: {
    'filter.origin'() {
      this.onRequest({
        pagination: this.pagination
      });
    },
    'filter.destination'() {
      this.onRequest({
        pagination: this.pagination
      });
    },
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
    getCarrierRegions() {
      const endpoint = `carriers/${this.table.carrier}/regions`;
      return api.fetch(endpoint, { params: { limit: 1000 } })
        
        .then(result => {
          return result.response.data;
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
          if (e instanceof Error)
            throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    // store method
    copyTable(values) {
      const options = {
        method : 'PUT',
       
        body   : (values),
      };

      return api.fetch(`delivery_tax_groups/${this.table.id}/copy-taxes`, options)
        
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
        method: 'DELETE',
      };

      let endpoint = `delivery_taxes/${id}`;
      return api.fetch(endpoint, options)
        .catch(e => {
          if (e instanceof Error)
            throw new Error(e.errors._error);

          throw new Error(e.message);
        });
    },

    loadCarrierRegions() {
      if (!this.regions.origin.length) {
        this.getCarrierRegions()
          .then(regions => {
            if (regions.members.length) {
              let _regions = [];

              _regions.push({
                label: 'Todas',
                value: null
              });

              regions.members.forEach((region, i) => {
                _regions.push({
                  label: region.name,
                  value: region.id
                });
              });

              this.regions.origin      = _regions;
              this.regions.destination = _regions;
            }
          });
      }
    },

    prepareItemForm(values) {
      this.item.id           = values !== null ? values.id : null;
      this.item.name         = values !== null ? values.taxName : null;
      this.item.finalWeight  = values !== null ? (parseFloat(values.finalWeight) + 0.001).toFixed(2) : null;
      this.item.price        = values !== null ? (parseFloat(values.price) + 0.001).toFixed(2) : null;
      this.item.origin       = values !== null ? values.origin.id : null;
      this.item.destination  = values !== null ? values.destination.id : null;
      this.item.minimumPrice = values !== null ? (parseFloat(values.minimumPrice) + 0.001).toFixed(2) : '0,00';
      this.item.optional     = values !== null ? values.optional : false;

      if (values !== null) {
        this.dialog = true;
      }
    },

    onSubmit2() {
      this.$refs.copyForm.validate()
        .then(success => {
          if (success) {
            this.copying = true;

            this.copyTable({
            	"taxType": "tabela",
            	"from"   : {
            		"origin"     : this.copy.fromOrigin,
            		"destination": this.copy.fromDest,
            	},
            	"to"     : {
            		"origin"     : this.copy.toOrigin,
            		"destination": this.copy.toDest,
            	}
            })
            .then(data => {
              if (data) {
                this.$refs.copyForm.reset();

                this.onRequest({
                  pagination: this.pagination
                });

                this.$emit('saved', data);
              }
            })
            .catch(error => {
              this.$refs.copyForm.reset();

              this.$emit('error', { message: error.message });
            })
            .finally(() => {
              this.copying = false;
            });
          }
      })
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
              	"taxName"          : this.item.name,
              	"taxType"          : "fixed",
                "taxSubtype"       : null,
                "regionOrigin"     : `/delivery_regions/${this.item.origin}`,
                "regionDestination": `/delivery_regions/${this.item.destination}`,
                "price"            : parseFloat(this.item.price.replace(',', '.')),
              	"minimumPrice"     : parseFloat(this.item.minimumPrice.replace(',', '.')),
              	"finalWeight"      : parseFloat(this.item.finalWeight.replace(',', '.')),
              	"groupTax"         : `/delivery_tax_groups/${this.table.id}`,
              	"taxOrder"         : 0,
              	"optional"         : this.item.optional
              };
            }
            // PUT
            else {
              payload = {
              	"taxName"          : this.item.name,
                "regionOrigin"     : `/delivery_regions/${this.item.origin}`,
                "regionDestination": `/delivery_regions/${this.item.destination}`,
                "price"            : parseFloat(this.item.price.replace(',', '.')),
              	"minimumPrice"     : parseFloat(this.item.minimumPrice.replace(',', '.')),
                "finalWeight"      : parseFloat(this.item.finalWeight.replace(',', '.')),
              	"optional"         : this.item.optional
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

      params['taxType']            = 'fixed';
      params['exists[taxSubtype]'] = false;

      if (this.filter.origin === null) {
        params['exists[regionOrigin]'] = true;
      }
      else {
        params['regionOrigin'] = this.filter.origin;
      }

      if (this.filter.destination === null) {
        params['exists[regionDestination]'] = true ;
      }
      else {
        params['regionDestination'] = this.filter.destination;
      }

      this.isLoading = true;

      this.getItems(params)
        .then(data => {
          let _items = [];

          if (data.members.length) {
            for (let index in data.members) {
              _items.push({
                id          : data.members[index].id,
                taxName     : data.members[index].taxName,
                origin      : {
                  id  : data.members[index].regionOrigin.id,
                  name: data.members[index].regionOrigin.region,
                },
                destination : {
                  id  : data.members[index].regionDestination.id,
                  name: data.members[index].regionDestination.region,
                },
                price       : data.members[index].price,
                minimumPrice: data.members[index].minimumPrice,
                finalWeight : data.members[index].finalWeight,
                type        : data.members[index].taxType,
                subType     : data.members[index].taxSubtype,
                optional    : data.members[index].optional,
                deadline    : data.members[index].regionDestination.deadline,
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
        if (key === 'float-not-required' && (val === null || val === '0,00')) {
          return true;
        }
        else if (!val || !(val && val.length > 0))
          return 'Este campo é obrigatório';

        return true;
      };
    },
  },
};
</script>
