import { ref, computed, onMounted } from 'vue'
import type { Domain, DomainStatus } from '../types/domain'
import { fetchDomains } from '../services/domainService'

export function useDomains() {
  const domains = ref<Domain[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const selectedRegistrar = ref('')
  const selectedStatus = ref<DomainStatus | ''>('')

  const filteredDomains = computed(() => {
    const query = searchQuery.value.toLowerCase()
    const registrar = selectedRegistrar.value
    const status = selectedStatus.value

    return domains.value.filter((d) => {
      if (query && !d.domain.toLowerCase().includes(query)) return false
      if (registrar && d.registrar !== registrar) return false
      if (status && d.status !== status) return false
      return true
    })
  })

  const registrarOptions = computed(() => {
    const registrars = domains.value
      .map((d) => d.registrar)
      .filter((r): r is string => !!r)
    return [...new Set(registrars)].sort()
  })

  async function loadDomains() {
    loading.value = true
    error.value = null
    try {
      domains.value = await fetchDomains()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An unexpected error occurred.'
    } finally {
      loading.value = false
    }
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedRegistrar.value = ''
    selectedStatus.value = ''
  }

  onMounted(loadDomains)

  return {
    domains,
    filteredDomains,
    loading,
    error,
    searchQuery,
    selectedRegistrar,
    selectedStatus,
    registrarOptions,
    loadDomains,
    clearFilters,
  }
}
