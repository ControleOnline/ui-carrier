<template>
  <div class="row items-center justify-center">
    <div class="flex flex-center" v-if="isLoading">
      <q-circular-progress
        :indeterminate="isLoading"
        size="sm"
        color="primary"
        class="q-ma-md"
      />
      Carregando...
    </div>

    <div
      class="col-12 q-mt-md"
      :style="isLoading ? 'visibility:hidden' : 'visibility:visible'"
    >
      <q-markup-table v-if="item !== null">
        <tbody>
          <tr>
            <td class="text-left text-bold">Tipo de integração</td>
            <td class="text-left">
              <q-select
                dense
                outlined
                lazy-rules
                stack-label
                emit-value
                map-options
                v-model="item.type"
                :options="settings.select.types"
                :rules="[(val) => val !== null || 'Selecione um tipo']"
              />
            </td>
          </tr>
          <tr>
            <td class="text-left text-bold">Usuário</td>
            <td class="text-left">
              <q-input
                dense
                outlined
                lazy-rules
                stack-label
                v-model="item.user"
                type="text"
                class="q-mt-md"
                :rules="[isInvalid('user')]"
              />
            </td>
          </tr>
          <tr>
            <td class="text-left text-bold">Senha</td>
            <td class="text-left">
              <q-input
                dense
                outlined
                lazy-rules
                stack-label
                v-model="item.password"
                type="text"
                class="q-mt-md"
                :rules="[isInvalid('password')]"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div class="row justify-end">
        <q-btn
          :loading="saving"
          icon="save"
          label="Salvar"
          size="md"
          color="primary"
          class="q-mt-md"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script>
const SETTINGS = {
  select: {
    types: [
      {
        label: "Selecione um tipo",
        value: null,
      },
      {
        label: "Correios",
        value: "correios",
      },
      {
        label: "Jad Log",
        value: "jadlog",
      },
      {
        label: "SSW",
        value: "ssw",
      },
    ],
  },
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
      saving: false,
      settings: SETTINGS,
      isLoading: false,
      item: {
        type: SETTINGS.select.types[0],
        user: null,
        password: null,
      },
    };
  },

  created() {
    this.onRequest();
  },

  methods: {
    // store method
    getItems() {
      let endpoint = `carriers/${this.id}/integration`;
      return api.fetch
        (endpoint)

        .then((result) => {
          return result.response.data;
        });
    },

    // store method
    save(values) {
      let options = {
        method: "PUT",
        
        body: (values),
      };

      let endpoint = `carriers/${this.id}/integration`;
      return api.fetch
        (endpoint, options)

        .then((data) => {
          if (data.response) {
            if (data.response.success === false) throw new Error(data.response.error);

            return data.response.data;
          }

          return null;
        });
    },

    onSubmit() {
      this.saving = true;

      this.save({
        type: this.item.type,
        user: this.item.user,
        password: this.item.password,
      })
        .then((data) => {
          if (data) {
            this.$emit("saved", data);
          }
        })
        .catch((error) => {
          this.$emit("error", { message: error.message });
        })
        .finally(() => {
          this.saving = false;
        });
    },

    onRequest() {
      if (this.isLoading) return;

      this.isLoading = true;

      this.getItems()
        .then((data) => {
          if (data !== null) {
            this.item.type = data.type === null ? SETTINGS.select.types[0] : data.type;
            this.item.user = data.user;
            this.item.password = data.password;
          }
        })
        .finally(() => {
          this.isLoading = false;
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
