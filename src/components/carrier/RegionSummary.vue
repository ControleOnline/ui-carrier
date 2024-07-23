<template>
  <div class="row items-center justify-center">
    <div class="col-12 q-mt-md">
      <q-form @submit="onSubmit" class="q-mt-sm" ref="myForm">
        <div class="row q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6">
            <q-input
      dense
      outlined lazy-rules stack-label
              v-model="item.name"
              type   ="text"
              label  ="Nome"
              class  ="q-mt-md"
              :rules ="[isInvalid('name')]"
            />
          </div>
          <div class="col-xs-12 col-sm-6">
            <q-input
      dense
      outlined lazy-rules stack-label reverse-fill-mask
              v-model  ="item.deadline"
              type     ="text"
              label    ="Prazo (dias)"
              class    ="q-mt-md"
              :rules   ="[isInvalid('deadline')]"
              mask     ="#"
              fill-mask="0"
            />
          </div>
          <div class="col-xs-12 col-sm-6">
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
          </div>
        </div>

        <div class="row justify-end">
          <q-btn
            :loading="saving"
            type    ="submit"
            icon    ="save"
            label   ="Salvar"
            size    ="md"
            color   ="primary"
            class   ="q-mt-md"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    region: {
      required: true,
    },
    
  },

  data() {
    return {
      saving: false,
    };
  },

  computed: {
    item() {
      return this.region || {};
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

    onSubmit() {
      this.saving = true;

      this.save({
        "regionName": this.item.name,
        "deadline"  : parseInt(this.item.deadline),
        "taxValue"  : parseFloat(this.item.tax.replace(',', '.')),
      })
        .then (data => {
          if (data) {
            this.$emit('saved', this.item);
          }
        })
        .catch(error => {
          this.$emit('error', { message: error.message });
        })
        .finally(() => {
          this.saving = false;
        });
    },

    isInvalid(key) {
      return val => {
        if (key == 'money') {
          if (!val || !(parseFloat(val.replace(',', '.')) > 0))
            return this.$t('messages.fieldRequired');

          return true;
        }

        if (key == 'monthday') {
          if (!val || !(parseInt(val) > 0 && parseInt(val) < 32))
            return this.$t('messages.fieldRequired');

          return true;
        }

        if (!(val && val.length > 0))
          return this.$t('messages.fieldRequired');

        return true;
      };
    },
  },
};
</script>
