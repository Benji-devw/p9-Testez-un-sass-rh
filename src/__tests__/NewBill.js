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
    jest.spyOn(mockStore, "bills")
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
    test("Then input 'Nom de la dépense' is empty ", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const input = screen.getByTestId("expense-name");
      expect(input.value).toBe("");
    });

    // Scénario 12
    test("Then upload file is type jpg jpeg or png", async () => {
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
      // console.log(mockStore.bills().list());
      // console.log(newBillInstance.fileUrl);
      expect(newBillInstance.fileUrl).toBe(
        "https://localhost:3456/images/test.jpg"
      );
    });

    // test("then an error occured when uploading file", async () => {
    //   const file = new File(["file contents"], "test.pdf", {
    //     type: "application/pdf",
    //   });
    //   mockStore.bills.mockImplementationOnce(() => {
    //     return {
    //       create : (bill) =>  { return Promise.reject(new Error("Erreur 500")) }
    //     }})
    //     const html = NewBillUI();
    //     document.body.innerHTML = html;
    //     const onNavigate = jest.fn((e) => e);
    //     const newBillInstance = new NewBill({
    //       document,
    //       onNavigate,
    //       store: mockStore,
    //       localStorage: window.localStorage,
    //     });
    //     const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
    //     await waitFor(() => {
    //       const input = screen.getByTestId("file"); // Get the file input
    //       input.addEventListener("change", handleChangeFile); // Add an event listener to the input
    //       userEvent.upload(input, file);
    //     });
    //     expect(console.error).toHaveBeenCalledWith("Erreur 500");
    // });

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
      expect(window.alert).toHaveBeenCalledWith("Ce type de fichier n'est pas accepté");
    });

    //TODO: submit du form champ vide ne call pas handleSubmite

    //TODO: submit du form champ et call handleSubmite

    //TODO: Su bill update  "updateBill" 

  });
});
