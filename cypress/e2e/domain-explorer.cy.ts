const TOTAL_DOMAINS = 29

describe('Domain Records Explorer', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/domains', { fixture: 'domains.json' }).as('getDomains')
    cy.visit('/')
    cy.wait('@getDomains')
    cy.get('tbody tr', { timeout: 10000 }).should('have.length', TOTAL_DOMAINS)
  })

  describe('initial load', () => {
    it('shows the page heading', () => {
      cy.contains('h1', 'Domain Records Explorer')
    })

    it('renders all domains in the table', () => {
      cy.get('tbody tr').should('have.length', TOTAL_DOMAINS)
    })

    it('renders the six column headers', () => {
      cy.get('thead th').should('have.length', 6)
    })
  })

  describe('search filter', () => {
    it('filters rows by partial domain name match', () => {
      // 'site' matches 'expiredsite.com' and 'suspendedsite.ca' — both contain 'site' in the domain name
      cy.get('#filter-search').type('site')
      cy.get('tbody tr').should('have.length', 2)
      cy.get('tbody tr').each(($row) => {
        expect($row.text().toLowerCase()).to.include('site')
      })
    })

    it('shows the empty state when no domains match', () => {
      cy.get('#filter-search').type('zzznomatchxxx')
      cy.get('tbody tr').should('not.exist')
      cy.contains('No results found')
    })
  })

  describe('status filter', () => {
    it('filters rows to only clientHold domains', () => {
      cy.get('#filter-status').select('clientHold')
      cy.get('tbody tr').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--clientHold').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--active').should('not.exist')
      cy.get('tbody tr .badge--pendingTransfer').should('not.exist')
    })

    it('filters rows to only pendingTransfer domains', () => {
      cy.get('#filter-status').select('pendingTransfer')
      cy.get('tbody tr').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--pendingTransfer').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--active').should('not.exist')
      cy.get('tbody tr .badge--clientHold').should('not.exist')
    })

    it('filters rows to only active domains', () => {
      cy.get('#filter-status').select('active')
      cy.get('tbody tr').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--active').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--clientHold').should('not.exist')
      cy.get('tbody tr .badge--pendingTransfer').should('not.exist')
    })
  })

  describe('registrar filter', () => {
    it('filters rows to only domains from the selected registrar', () => {
      cy.get('#filter-registrar').select('Tucows')
      cy.get('tbody tr').should('have.length', 7)
      cy.get('tbody tr').each(($row) => {
        expect($row.text()).to.include('Tucows')
      })
    })
  })

  describe('combined filters', () => {
    it('applies search and status filters together', () => {
      cy.get('#filter-search').type('example')
      cy.get('#filter-status').select('active')
      cy.get('tbody tr').should('have.length.greaterThan', 0)
      cy.get('tbody tr .badge--clientHold').should('not.exist')
      cy.get('tbody tr .badge--pendingTransfer').should('not.exist')
    })
  })

  describe('clear filters', () => {
    it('restores all rows after clearing filters', () => {
      cy.get('#filter-search').type('site')
      cy.get('tbody tr').should('have.length.lessThan', TOTAL_DOMAINS)

      cy.contains('button', 'Clear filters').click()

      cy.get('#filter-search').should('have.value', '')
      cy.get('tbody tr').should('have.length', TOTAL_DOMAINS)
    })
  })

  describe('sorting', () => {
    it('sorts by domain name descending on click of the active Domain header', () => {
      cy.get('thead th').first().click()
      cy.get('tbody tr').first().find('td').first().invoke('text').then((firstDomain) => {
        cy.get('tbody tr').last().find('td').first().invoke('text').then((lastDomain) => {
          expect(firstDomain.trim().localeCompare(lastDomain.trim())).to.be.greaterThan(0)
        })
      })
    })
  })

  describe('domain detail modal', () => {
    it('opens the modal when a row is clicked', () => {
      cy.get('tbody tr').first().click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('displays the domain name in the modal header', () => {
      cy.get('tbody tr').first().then(($row) => {
        const domainName = $row.find('td').first().text().trim()
        cy.wrap($row).click()
        cy.get('.modal__title').should('contain', domainName)
      })
    })

    it('closes the modal when the close button is clicked', () => {
      cy.get('tbody tr').first().click()
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('.modal__close').click()
      cy.get('[role="dialog"]').should('not.exist')
    })

    it('closes the modal when the Escape key is pressed', () => {
      cy.get('tbody tr').first().click()
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('body').type('{esc}')
      cy.get('[role="dialog"]').should('not.exist')
    })

    it('closes the modal when the overlay is clicked', () => {
      cy.get('tbody tr').first().click()
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('.overlay').click({ force: true })
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('empty state', () => {
    it('shows the no-results state when filters produce no matches', () => {
      cy.get('#filter-search').type('zzznomatchxxx')
      cy.contains('No results found').should('be.visible')
      cy.get('table').should('not.exist')
    })
  })
})
