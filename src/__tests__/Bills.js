/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
// import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // jest.spyOn(mockStore, "bills")
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

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      const antiChrono = (a, b) => new Date(b) - new Date(a)
      const datesSorted = [...dates].sort(antiChrono)
      // console.log(dates, datesSorted)
      expect(dates).toEqual(datesSorted)
    })
  })
})
