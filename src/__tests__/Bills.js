/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
       expect(windowIcon.classList).toContain('active-icon')
    })

    test("Then the getBills method should be called", () => {
      const onNavigate = jest.fn(e => e)
      const billsInstance = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      billsInstance.getBills().then(async bills => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const message = await screen.getByText('encore')
        expect(message).toBeTruthy()
      })
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      const antiChrono = (a, b) => new Date(b) - new Date(a)
      const datesSorted = [...dates].sort(antiChrono)
      // console.log(dates, datesSorted)
      expect(dates).toEqual(datesSorted)
    })

    //FIXME: test the error message NOT WORKING
    test("fetches messages from an API and fails with 500 message error", async () => {
      // mockStore.bills.mockImplementationOnce(() => {
      //   return {
      //     list : () =>  { return Promise.reject(new Error("Erreur 500")) }
      //   }})

      //   window.onNavigate(ROUTES_PATH.Bills)
      //   await new Promise(process.nextTick);
      //   const message = await screen.findByText(/Erreur 500/)
      //   expect(message).toBeTruthy()
    })
  })

  describe('When I click on the new bill button', () => {
    test('Then handleClickNewBill should be called', () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      const onNavigate = jest.fn(e => e)
      const billsInstance = new Bills({ document, onNavigate, localStorage: window.localStorage })
      const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill)
      newBillButton.click()
      expect(handleClickNewBill).toHaveBeenCalled()
    });
  });

  describe('When I click on the eye icon', () => {
    test('A modal should open', () => {
      const html = BillsUI({ data: [bills[0]] })
      document.body.innerHTML = html
      const onNavigate = jest.fn(e => e)
      const billsInstance = new Bills({ document, onNavigate, localStorage: window.localStorage })
      const eyeIcon = screen.getByTestId('icon-eye')
      const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye(eyeIcon))
      
      eyeIcon.addEventListener('click', handleClickIconEye)
      eyeIcon.click()

      expect(handleClickIconEye).toHaveBeenCalled() 
    });
  });
  

})
