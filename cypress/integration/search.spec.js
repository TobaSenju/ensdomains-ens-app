const ROOT = 'http://localhost:3000'
const NAME_ROOT = `${ROOT}/name`

describe('Visit a domain', () => {
  //Visit a domain, check the owner, resolver, address, content exists
  it('Visits the Kitchen Sink', () => {
    cy.visit(ROOT)
    cy.getByPlaceholderText('Search', { exact: false }).type('resolver.eth')
    cy.get('button')
      .contains('Search')
      .click()

    cy.queryByText('owner')

    //TODO expect owner, resolver, address, content
  })
})

describe('Name detail view', () => {
  //Visit a domain

  xit('cannot transfer ownership to a non-ethereum address', () => {
    cy.visit(`${NAME_ROOT}/awesome.eth`)
    cy.getByText('Transfer').click()

    cy.getByTestId('name-details').within(container => {
      cy.getByPlaceholderText('address', { container, exact: false }).type(
        '0x0000000000000000000000000000000000000001'
      )
    })

    cy.getByText('Transfer').click()
    cy.getByText('Confirm').click()

    cy.getByText('0x0000000000000000000000000000000000000001').should('exist')
  })

  it('can transfer ownership', () => {
    cy.visit(`${NAME_ROOT}/awesome.eth`)
    cy.getByText('Transfer').click()

    cy.getByTestId('name-details').within(container => {
      cy.getByPlaceholderText('address', { container, exact: false }).type(
        '0x0000000000000000000000000000000000000001'
      )
    })

    cy.getByText('Transfer').click()
    cy.getByText('Confirm').click()

    cy.getByText('0x0000000000000000000000000000000000000001').should('exist')
  })

  xit('cannot change the resolver to a non-ethereum address', () => {
    cy.visit(`${NAME_ROOT}/superawesome.eth`)
    cy.getByTestId('edit-resolver').click()

    cy.getByTestId('name-details').within(container => {
      cy.getByPlaceholderText('address', { container, exact: false }).type(
        '0x0000000000000000000000000000000000000002'
      )
    })

    cy.getByText('Save').click()

    cy.getByText('0x0000000000000000000000000000000000000002').should('exist')
  })

  it('can change the resolver', () => {
    cy.visit(`${NAME_ROOT}/superawesome.eth`)
    cy.getByTestId('edit-resolver').click()

    cy.getByTestId('name-details').within(container => {
      cy.getByPlaceholderText('address', { container, exact: false }).type(
        '0x0000000000000000000000000000000000000002'
      )
    })

    cy.getByText('Save').click()

    cy.getByText('0x0000000000000000000000000000000000000002').should('exist')
  })

  it('can change the resolver to the public resolver', () => {
    cy.visit(`${NAME_ROOT}/superawesome.eth`)
    cy.getByTestId('edit-resolver').click()

    cy.getByText('Public Resolver', { exact: false }).click()

    cy.getByTestId('name-details').within(container => {
      cy.getByPlaceholderText('address', { container, exact: false }).then(
        $address => {
          cy.getByText('Save').click()
          cy.getByText($address.val()).should('exist')
        }
      )
    })
  })

  it(`prevents user from adding a record that isn't an address`, () => {
    cy.visit(`${NAME_ROOT}/notsoawesome.eth`)

    cy.getByTestId('name-details').within(container => {
      cy.getByText('+', { exact: false }).click()
      cy.getByText('select', { exact: false }).click()
      cy.get('[role="option"]')
        .contains('Address')
        .click()
      cy.getByPlaceholderText('Type an Ethereum address', {
        exact: false
      }).type('blah')
      cy.queryByText('save', { exact: false }).should('be.disabled')
      //force click like a real user
      cy.getByText('save', { exact: false }).click({ force: true })

      // Form was not closed and nothing happened
      cy.queryByValue('blah').should('exist')
    })
  })

  it('can add use add record to add an address', () => {
    cy.visit(`${NAME_ROOT}/notsoawesome.eth`)

    cy.getByTestId('name-details').within(container => {
      cy.getByText('+', { exact: false }).click()
      cy.getByText('select', { exact: false }).click()
      cy.get('[role="option"]')
        .contains('Address')
        .click()

      cy.getByPlaceholderText('Enter an Ethereum address', {
        exact: false
      }).type('0x0000000000000000000000000000000000000003')
      cy.getByText('save', { exact: false }).click()
      //form closed
      cy.queryByText('save', { exact: false, timeout: 10 }).should('not.exist')
      cy.queryByText('cancel', { exact: false, timeout: 10 }).should(
        'not.exist'
      )

      //Value updated
      cy.queryByText('0x0000000000000000000000000000000000000003', {
        exact: false
      }).should('exist')
    })
  })

  it('can add use add record to add a content hash', () => {
    cy.visit(`${NAME_ROOT}/notsoawesome.eth`)

    cy.getByTestId('name-details').within(container => {
      cy.getByText('+', { exact: false }).click()
      cy.getByText('select', { exact: false }).click()
      cy.get('[role="option"]')
        .contains('Content')
        .click()

      cy.getByPlaceholderText('Enter a content hash', {
        exact: false
      }).type(
        '0xd1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162'
      )
      cy.getByText('save', { exact: false }).click()
      //form closed
      cy.queryByText('save', { exact: false, timeout: 10 }).should('not.exist')
      cy.queryByText('cancel', { exact: false, timeout: 10 }).should(
        'not.exist'
      )

      //Value updated
      cy.queryByText(
        '0xd1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162',
        {
          exact: false
        }
      ).should('exist')
    })
  })

  it('can change the address', () => {
    cy.visit(`${NAME_ROOT}/abittooawesome.eth`)

    cy.getByTestId('name-details').within(container => {
      cy.getByTestId('edit-address', { exact: false }).click()
      cy.getByPlaceholderText('Enter an Ethereum address', {
        exact: false
      }).type('0x0000000000000000000000000000000000000003')
      cy.getByText('save', { exact: false }).click()
      //form closed
      cy.queryByText('save', { exact: false, timeout: 10 }).should('not.exist')
      cy.queryByText('cancel', { exact: false, timeout: 10 }).should(
        'not.exist'
      )
      //Value updated
      cy.queryByText('0x0000000000000000000000000000000000000003', {
        exact: false
      }).should('exist')
    })
  })

  it('can change the content hash', () => {
    cy.visit(`${NAME_ROOT}/abittooawesome.eth`)

    cy.getByTestId('name-details').within(container => {
      cy.getByTestId('edit-content', { exact: false }).click()
      cy.getByPlaceholderText('Enter a content hash', {
        exact: false
      }).type(
        '0xd1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162'
      )
      cy.getByText('save', { exact: false }).click()
      //form closed
      cy.queryByText('save', { exact: false, timeout: 10 }).should('not.exist')
      cy.queryByText('cancel', { exact: false, timeout: 10 }).should(
        'not.exist'
      )
      //Value updated
      cy.queryByText(
        '0xd1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162',
        {
          exact: false
        }
      ).should('exist')
    })
  })

  it('can navigate to a subdomain', () => {
    cy.visit(`${NAME_ROOT}/subdomaindummy.eth`)
      .getByText('subdomains', { exact: false })
      .click()
      .getByText('original.addsubdomain.eth')
      .click()
  })

  it.only('can add a subdomain', () => {
    cy.visit(`${NAME_ROOT}/subdomaindummy.eth`)
      .getByText('subdomains', { exact: false })
      .click()

    cy.getByTestId('subdomains').within(() => {
      cy.getByText('add', { exact: false })
        .click()
        .get('input')
        .type('unoriginal')
        .getByText('save', { exact: false })
        .click()
        .getByText('unoriginal.subdomaindummy.eth')
        .click()
        .url()
        .should('include', '/name/unoriginal.subdomaindummy.eth')
    })
  })
})

describe('Search results', () => {
  //Visit a domain

  it('can search for a domain', () => {
    // cy.visit(ROOT)
    // cy.getByPlaceholderText('Search', { exact: false }).type('resolver.eth')
    // cy.get('button')
    //   .contains('Search')
    //   .click()
  })

  it('can search for a subdomain with fewer letters, but shows an error for TLDs', () => {
    // cy.visit(ROOT)
    // cy.getByPlaceholderText('Search', { exact: false }).type('resolver.eth')
    // cy.get('button')
    //   .contains('Search')
    //   .click()
  })

  it('can search for a subdomain with fewer letters, but shows an error for TLDs', () => {
    // cy.visit(ROOT)
    // cy.getByPlaceholderText('Search', { exact: false }).type('resolver.eth')
    // cy.get('button')
    //   .contains('Search')
    //   .click()
  })
})
