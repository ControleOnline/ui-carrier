<template>
  <q-page padding>
    <q-card style="min-height: 90vh">
      <q-card-section>
        <div class="row">
          <div class="col-6 q-pa-md text-h6">
            {{ carrier.name || "Carregando..." }}
          </div>
          <div class="col-6 q-pa-md">
            <q-card-section align="right" class="q-pt-none">
              <q-rating
                v-model="carrier.averageRating"
                size="2.9em"
                color="yellow"
                class="justify-center"
              />
            </q-card-section>
          </div>

          <div class="col-12 q-pa-md text-center">
            <PersonAvatar
              :url="carrier.avatar"
              :upload="`${baseUrl}/peoples/${this.$route.params.id}/upload-logo`"
              @uploaded="
                (data) => {
                  if (data.url) {
                    this.carrier.avatar = `${this.baseUrl}${data.url}`;
                  }
                }
              "
            />
          </div>

          <div class="col-12">
            <q-tabs
              align="start"
              v-model="currentTab"
              no-caps
              class="bg-transparent text-primary"
              :horizontal="$q.screen.gt.xs"
              dense
            >
              <q-tab name="summary" :label="$t('Details')" />
              <q-tab
                name="employees"
                :label="$t('Employees')"
                v-if="carrier.peopleType === 'J'"
              />
              <q-tab name="tasks" :label="$t('Tasks')" />
              <q-tab name="billing" :label="$t('Billing')" />
              <q-tab name="calls" :label="$t('Calls')" />
              <q-tab name="regions" label="Praças" />
              <q-tab name="tables" label="Tabelas de frete" />
              <q-tab name="integration" label="Integração" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="currentTab">
              <q-tab-panel name="summary" class="q-px-none row q-col-gutter-y-lg">
                <div class="col-12">
                  <CustomerSummary
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12">
                  <PeopleAdminAddresses
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12 row">
                  <div class="col-xs-12 col-sm-6">
                    <PeopleAdminEmails
                      class="full-height"
                      :people_type="'carriers'"
                      :id="carrierId"
                      @error="
                        (error) => {
                          this.$q.notify({
                            message: error.message,
                            position: 'bottom',
                            type: 'negative',
                          });
                        }
                      "
                      @saved="
                        (data) => {
                          this.$q.notify({
                            message: 'Data successfully saved',
                            position: 'bottom',
                            type: 'positive',
                          });
                        }
                      "
                    />
                  </div>

                  <div class="col-xs-12 col-sm-6 q-pl-lg">
                    <PeopleAdminPhones
                      class="full-height"
                      :people_type="'carriers'"
                      :id="carrierId"
                      @error="
                        (error) => {
                          this.$q.notify({
                            message: error.message,
                            position: 'bottom',
                            type: 'negative',
                          });
                        }
                      "
                      @saved="
                        (data) => {
                          this.$q.notify({
                            message: 'Data successfully saved',
                            position: 'bottom',
                            type: 'positive',
                          });
                        }
                      "
                    />
                  </div>
                </div>

                <div class="col-12">
                  <PeopleAdminDocuments
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12" v-if="carrier.peopleType === 'F'">
                  <PeopleAdminUsers
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12" v-if="carrier.peopleType === 'F'">
                  <CustomerCompany
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });

                        if (data.id) {
                          this.$router.push({
                            name: 'CustomersDetails',
                            params: { id: data.id },
                          });
                        }
                      }
                    "
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="tasks" class="q-pa-none">
                <OrderTasks
                  :provider="provider"
                  :client="people"
                  :task_type="'support'"
                />
              </q-tab-panel>
              <q-tab-panel name="employees" class="q-px-none row q-col-gutter-y-lg">
                <div class="col-12" v-if="carrier.peopleType === 'J'">
                  <PeopleAdminEmployees
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });

                        if (data.id) {
                          this.$router.push({
                            name: 'CustomersDetails',
                            params: { id: data.id },
                          });
                        }
                      }
                    "
                  />
                </div>

                <div class="col-12">
                  <CustomerSalesman
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="billing" class="q-px-none row q-col-gutter-y-lg">
                <div class="col-12">
                  <PeopleAdminBilling
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12">
                  <CustomerOrders
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>

                <div class="col-12">
                  <CustomerContracts
                    :people_type="'carriers'"
                    :id="carrierId"
                    @error="
                      (error) => {
                        this.$q.notify({
                          message: error.message,
                          position: 'bottom',
                          type: 'negative',
                        });
                      }
                    "
                    @saved="
                      (data) => {
                        this.$q.notify({
                          message: 'Data successfully saved',
                          position: 'bottom',
                          type: 'positive',
                        });
                      }
                    "
                  />
                </div>
              </q-tab-panel>
              <q-tab-panel name="calls" class="q-px-xs">
                <OrderTasks
                  :provider="provider"
                  :client="people"
                  :task_type="'relationship'"
                />
              </q-tab-panel>
              <q-tab-panel name="regions">
                <CarrierRegions
                  :people_type="'carriers'"
                  :id="carrierId"
                  @error="
                    (error) => {
                      this.$q.notify({
                        message: error.message,
                        position: 'bottom',
                        type: 'negative',
                      });
                    }
                  "
                  @saved="
                    (data) => {
                      this.$q.notify({
                        message: 'Os dados foram salvos com sucesso',
                        position: 'bottom',
                        type: 'positive',
                      });

                      this.$router.push({
                        name: 'CarrierRegionDetails',
                        params: {
                          id: this.carrierId,
                          regionId: data.id,
                        },
                      });
                    }
                  "
                />
              </q-tab-panel>

              <q-tab-panel name="tables">
                <CarrierTables
                  :people_type="'carriers'"
                  :id="carrierId"
                  @error="
                    (error) => {
                      this.$q.notify({
                        message: error.message,
                        position: 'bottom',
                        type: 'negative',
                      });
                    }
                  "
                  @saved="
                    (data) => {
                      this.$q.notify({
                        message: 'Os dados foram salvos com sucesso',
                        position: 'bottom',
                        type: 'positive',
                      });

                      if (data !== false) {
                        this.$router.push({
                          name: 'CarrierTableDetails',
                          params: {
                            id: this.carrierId,
                            tableId: data.id,
                          },
                        });
                      }
                    }
                  "
                />
              </q-tab-panel>

              <q-tab-panel name="integration">
                <CarrierIntegration
                  :people_type="'carriers'"
                  :id="carrierId"
                  @error="
                    (error) => {
                      this.$q.notify({
                        message: error.message,
                        position: 'bottom',
                        type: 'negative',
                      });
                    }
                  "
                  @saved="
                    (data) => {
                      this.$q.notify({
                        message: 'Os dados foram salvos com sucesso',
                        position: 'bottom',
                        type: 'positive',
                      });
                    }
                  "
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
import PersonAvatar from "@controleonline/quasar-legacy-ui/ui-common/src/components/Common/PersonAvatar";

import OrderTasks from "@controleonline/ui-tasks/src/components/Tasks";
import { mapGetters } from "vuex";

import CarrierIntegration from "../../components/carrier/CarrierIntegration";
import CarrierRegions from "../../components/carrier/CarrierRegions";
import CarrierTables from "../../components/carrier/CarrierTables";

export default {
  components: {
    CarrierRegions,
    CarrierTables,
    CarrierIntegration,
    PersonAvatar,
    
  },

  created() {
    this.getCarrier();
  },
  computed: {
    ...mapGetters({
      myProvider: "people/currentCompany",
    }),
  },

  data() {
    return {
      baseUrl: this.$entrypoint,
      currentTab: "summary",
      carrierId: this.$route.params.id,
      people: {},
      provider: null,
      carrier: {
        name: null,
        type: null,
        avatar: null,
        averageRating: 4,
      },
    };
  },
  watch: {
    myProvider(provider) {
      if (provider !== null) {
        this.provider = provider.id;
      }
    },
  },
  methods: {
    getCarrier() {
      return api
        .fetch(`people/${this.carrierId}`)

        .then((data) => {
          this.people = data;
          this.people.id = this.carrierId;
          if (data["@id"]) {
            this.carrier = data;
            this.carrier.averageRating = data.averageRating;
            this.carrier.name = `${data.name} / ${data.alias}`;
            this.carrier.peopleType = data.peopleType;
            this.carrier.avatar =
              data.file !== null ? `${this.$entrypoint}${data.file.url}` : null;
          }
        });
    },
  },
};
</script>
