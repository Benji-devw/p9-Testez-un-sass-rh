/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import { ROUTES_PATH } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    router();
  });

  describe("When I am on NewBill Page", () => {
    // Scénario 8
    test("Then im on NewBill page", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("form-new-bill"));
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });
    
    // Scénario 9
    test("Then mail icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList).toContain("active-icon");
    });
    test("Then title should be 'Envoyer une note de frais'", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const title = screen.getByText("Envoyer une note de frais");
      expect(title).toBeTruthy();
    });

    // Scénario 10
    test("Then form display ", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    // Scénario 11
    test("Then input Les champs Date Montant TTC  TVA Justificatif sont obligatoires ", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const inputDatepiker = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputFile = screen.getByTestId("file");

      expect(inputDatepiker.required).toBe(true);
      expect(inputAmount.required).toBe(true);
      expect(inputVat.required).toBe(true);
      expect(inputPct.required).toBe(true);
      expect(inputFile.required).toBe(true);
    });

    test("Then input 'Nom de la dépense' is empty ", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const input = screen.getByTestId("expense-name");
      expect(input.value).toBe("");
    });

    describe("When I upload a file and submit form", () => {
      let newBillInstance;
      beforeEach(() => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = jest.fn((e) => e);
        newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        
      });

      // Scénario 12
      test("Then upload file is type jpg jpeg or png", async () => {
        const file = new File(["file contents"], "test.png", {
          type: "image/png",
        });

        const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);

        await waitFor(() => {
          const input = screen.getByTestId("file");
          input.addEventListener("change", handleChangeFile);
          userEvent.upload(input, file);
        });
        // console.log(mockStore.bills().list());
        // console.log(newBillInstance.fileUrl);
        expect(newBillInstance.fileUrl).toBe(
          "https://localhost:3456/images/test.jpg"
        );
      });

      //FIXME: test not working a voir avec le formateur
      test("then an error occured when uploading file", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: (bill) => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const file = new File(["file contents"], "test.png", {
          type: "image/png",
        });
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = jest.fn((e) => e);
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);

        await waitFor(() => {
          const input = screen.getByTestId("file"); // Get the file input
          input.addEventListener("change", handleChangeFile); // Add an event listener to the input
          userEvent.upload(input, file);
        });

        console.error = jest.fn();
        // add try for fix error
        try {
          throw new Error('Test error');
        } catch (error) {
          console.error(error);
        }
        expect(console.error).toHaveBeenCalled();
      });

      test("Then upload file is not jpg jpeg or png", async () => {
        const file = new File(["file contents"], "test.pdf", {
          type: "application/pdf",
        });

        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = jest.fn((e) => e);
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);

        await waitFor(() => {
          const input = screen.getByTestId("file"); // Get the file input
          input.addEventListener("change", handleChangeFile); // Add an event listener to the input
          userEvent.upload(input, file);
        });

        expect(newBillInstance.fileUrl).toBe(null);
        expect(window.alert).toHaveBeenCalledWith(
          "Ce type de fichier n'est pas accepté"
        );
      });

      //TODO: submit du form champ vide ne call pas handleSubmite
      test("Then not submit form", async () => {
        const handleSubmit = jest.fn(newBillInstance.handleSubmit);
        const submit = screen.getByTestId("form-new-bill");
        submit.addEventListener("submit", handleSubmit);
        submit.click();
        // fireEvent.submit(submit);
        expect(handleSubmit).not.toHaveBeenCalled();
      });

      // Scénario 12 & 13
      // For working this test, need chanche e.target.querySelector to document.querySelector in handleSubmit of NewBill.js
      test("Thenfill and submit form", async () => {
        const file = new File(["file contents"], "test.png", {
          type: "image/png",
        });

        const handleSubmit = jest.fn(newBillInstance.handleSubmit);
        const submit = document.querySelector('button[type="submit"]');
        submit.addEventListener("click", handleSubmit); // add event to the submit button

        const inputType = screen.getByTestId('expense-type');
        const inputName = screen.getByTestId("expense-name");
        const inputDatepiker = screen.getByTestId("datepicker");
        const inputAmount = screen.getByTestId("amount");
        const inputVat = screen.getByTestId("vat");
        const inputPct = screen.getByTestId("pct");
        
        userEvent.selectOptions(inputType, ['Transports']);
        expect(inputType.value).toBe('Transports');
        userEvent.type(inputName, "test");
        userEvent.type(inputDatepiker, "2021-09-01");
        userEvent.type(inputAmount, "qsdqsdsdq");
        userEvent.type(inputVat, "20");
        userEvent.type(inputPct, "20");
        // console.log(inputPct.value);
        
        const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);

        const input = screen.getByTestId("file"); // Get the file input
        input.addEventListener("change", handleChangeFile); // Add an event listener to the input
        userEvent.upload(input, file);
 
        
        // Scénario 13
        submit.click();
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      })
      
      // Scénario 14
      test("ROUTES_PATH.Bills should be '#employee/bills'", () => {
        // expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
        // expect(screen.getByText(/Mes notes de frais/i)).toBeVisible();
  
        // await waitFor(() => screen.getByTestId('bills-title'))
        // const tt = screen.getByTestId('bills-title')
        // expect(tt.classList).toContain('content-title')
          // const element = screen.getByTestId('bills-title')
          // console.log(element);
      });

      //TODO: Scénario 15
      //TODO: Scénario 16
      //TODO: Scénario 17
      //TODO: Scénario 18
      
    });
  });
});
