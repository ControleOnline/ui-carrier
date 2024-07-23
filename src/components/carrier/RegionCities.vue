<template>
  <div class="row">
    <div class="col-12 q-mt-md">
      <q-table dense 
        :rows           ="items"
        :columns        ="settings.columns"
        :visible-columns="settings.visibleColumns"
        row-key         ="id"
        :loading        ="isLoading"
      >
        <template v-slot:top>
          <div class="col-4 q-mb-md text-h6">
            Lista de cidades da praça
          </div>
          <div class="col-8 q-mb-md">
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
            <q-td key="state" :props="props">{{ props.row.state }}</q-td>
            <q-td key="uf"    :props="props">{{ props.row.uf    }}</q-td>
            <q-td key="city"  :props="props">{{ props.row.city  }}</q-td>
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

    <q-dialog v-model="dialog" @before-show="onBeforeShowDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Adicionar cidades</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-form ref="myForm" @submit="onSubmit" class="q-mt-md">
            <q-select dense outlined  stack-label emit-value map-options options-cover
              label        ="Estados"
              v-model      ="item.state"
              :loading     ="loadingStates"
              :option-value="opt => Object(opt) === opt && 'uf'    in opt ? opt.uf    : null"
              :option-label="opt => Object(opt) === opt && 'state' in opt ? opt.state : '-'"
              :options     ="store.states"
              class        ="q-mt-md"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                  Sem resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
      dense
      outlined stack-label filled
              label  ="Cidades (separadas por virgula)"
              v-model="item.city"
              type   ="textarea"
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

const SETTINGS = {
  visibleColumns: [
    'state' ,
    'uf'    ,
    'city'  ,
    'action',
  ],
  columns       : [
    {
      name : 'state',
      field: row => row.state,
      align: 'left',
      label: 'Estado'
    },
    {
      name : 'uf',
      field: row => row.uf,
      align: 'left',
      label: 'UF'
    },
    {
      name : 'city',
      field: row => row.city,
      align: 'left',
      label: 'Cidade'
    },
    { name: 'action' },
  ],
};

Object.freeze(SETTINGS);

export default {
  props: {
    region: {
      required: true,
    },
    
  },

  data() {
    return {
      items        : [],
      dialog       : false,
      settings     : SETTINGS,
      saving       : false,
      isLoading    : false,
      loadingStates: false,
      store        : {
        states: [],
      },
      item         : {
        state: null,
        city : null,
      }
    };
  },

  created() {
    this.onRequest();
  },

  computed: {
    cities() {
      return this.region.cities || [];
    }
  },

  watch: {
    cities() {
      this.onRequest();
    }
  },

  methods: {
    // store method
    save(values) {
      let options = {
        method : 'PUT',
       
        body   : (values),
      };

      let endpoint = `carriers/${this.region.carrier}/regions/${this.region.id}`;
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
    getStates() {
      return api.fetch('states', { params: { 'order[state]': 'ASC' } })
        
        .then(result => {
          return result['hydra:member'];
        });
    },

    onBeforeShowDialog() {
      if (this.store.states.length == 0) {
        this.loadingStates = true;
        this.getStates()
          .then(states => {
            this.store.states = states;
          })
          .finally(() => {
            this.loadingStates = false;
          });
      }
    },

    onSubmit() {
      this.$refs.myForm.validate()
        .then(success => {
          if (success) {
            let cities = null;

            if (this.item.state == null) {
              this.$emit('error', { message: 'Informe o estado' });
              return;
            }

            if (this.item.city !== null) {
              cities = this.item.city
                .split (',')
                .filter((item) => {
                  return typeof(item) === 'string' && item.length > 0;
                })
                .map   ((item) => {
                  return item.trim();
                });
            }

            if (cities === null) {
              this.$emit('error', { message: 'Informe as cidades' });
              return;
            }

            this.saving = true;

            this.save({
            	"cities": {
            		"added": cities,
                "state": this.item.state
            	}
            })
            .then (data => {
              if (data) {
                this.$refs.myForm.reset();

                this.$emit('saved', this.item.city);
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

        this.save({
          "cities": {
            "removed": [item.id]
          }
        })
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

    onRequest() {
      if (this.isLoading)
        return;

      let _items = [];

      if (this.region.cities) {
        for (let index in this.region.cities) {
          _items.push({
            id    : this.region.cities[index].id,
            city  : this.region.cities[index].name,
            state : this.region.cities[index].state,
            uf    : this.region.cities[index].uf,
            _bussy: false,
          });
        }
      }

      this.items = _items;
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
