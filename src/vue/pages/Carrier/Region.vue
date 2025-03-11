<template>
  <q-page padding>
    <q-card style="min-height: 90vh;">
      <q-card-section>
        <q-btn flat no-caps
          icon ="arrow_back"
          :to  ="{ name: 'CarrierDetails', params: { id:  this.carrierId }}"
          label="Voltar à transportadora"
        />
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-pa-md text-h6">
            Cadastro de praças
          </div>

          <div class="col-12">
            <div class="q-pa-md text-subtitle1 text-center">
              {{ region.name || 'Carregando...' }}
            </div>
          </div>

          <div class="col-12">
            <q-tabs
              :horizontal="$q.screen.gt.xs"
              align      ="justify"
              v-model    ="currentTab"
              class      =" text-primary"
            >
              <q-tab
                name ="summary"
                label="Resumo"
              />
              <q-tab
                name ="cities"
                label="Cidades"
              />
            </q-tabs>

            <q-separator />

            <q-tab-panels
              v-model="currentTab"
            >
              <q-tab-panel name="summary">
                <CarrierRegionSummary
                  :region="region"
                  @error ="(error) => {
                    this.$q.notify({
                      message : error.message,
                      position: 'bottom',
                      type    : 'negative',
                    });
                  }"
                  @saved ="(data) => {
                    this.region.name     = data.name;
                    this.region.deadline = data.deadline;
                    this.region.tax      = data.tax;

                    this.$q.notify({
                      message : 'Os dados foram salvos com sucesso',
                      position: 'bottom',
                      type    : 'positive',
                    });
                  }"
                />
              </q-tab-panel>

              <q-tab-panel name="cities">
                <CarrierRegionCities
                  :region="region"
                  @error ="(error) => {
                    this.$q.notify({
                      message : error.message,
                      position: 'bottom',
                      type    : 'negative',
                    });
                  }"
                  @saved ="(data) => {
                    this.getRegion();

                    this.$q.notify({
                      message : 'Os dados foram salvos com sucesso',
                      position: 'bottom',
                      type    : 'positive',
                    });
                  }"
                  @removed="(data) => {
                    this.getRegion();
                  }"
                />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { api } from "app/modules/controleonline/ui-common/src/api";
import CarrierRegionCities from '../../components/carrier/RegionCities';
import CarrierRegionSummary from '../../components/carrier/RegionSummary';

export default {
  components: {
    CarrierRegionSummary,
    CarrierRegionCities ,
  },

  created() {
    this.getRegion();
  },

  data () {
    return {
      currentTab: 'cities',
      carrierId : this.$route.params.id,
      regionId  : this.$route.params.regionId,
      region    : {
        carrier : null,
        id      : null,
        name    : null,
        deadline: null,
        tax     : null,
        cities  : null
      }
    }
  },

  methods: {
    getRegion() {
      return api.fetch(`delivery_regions/${this.regionId}`)
        
        .then(data => {
          if (data['@id']) {
            this.region.carrier  = this.carrierId;
            this.region.id       = this.regionId;
            this.region.name     = data.region;
            this.region.deadline = data.deadline;
            this.region.tax      = (parseFloat(data.retrieveTax) + 0.001).toFixed(2);

            if (data.regionCity.length) {
              let cities = [];
              data.regionCity.forEach((item, i) => {
                cities.push({
                  id   : item.city['@id'].replace(/\D/g, ''),
                  name : item.city.city,
                  state: item.city.state.state,
                  uf   : item.city.state.uf,
                });
              });

              this.region.cities = cities;
            }
          }
        });
    }
  },
}
</script>
