import { render, screen, fireEvent } from '@testing-library/react';
import Bills from './Bills';

describe('Bills component', () => {
  test('handleClickIconEye should display the bill image in the modal', () => {
    // Mock the necessary elements and data
    const icon = document.createElement('div');
    icon.setAttribute('data-bill-url', 'https://example.com/bill.jpg');
    const modalBody = document.createElement('div');
    modalBody.setAttribute('id', 'modaleFile');
    document.body.appendChild(modalBody);

    // Render the Bills component
    render(<Bills />);

    // Trigger the handleClickIconEye function
    fireEvent.click(screen.getByTestId('icon-eye'), { target: icon });

    // Check if the bill image is displayed in the modal
    const billImage = screen.getByAltText('Bill');
    expect(billImage).toBeInTheDocument();
    expect(billImage.getAttribute('src')).toBe('https://example.com/bill.jpg');

    // Clean up the test environment
    document.body.removeChild(modalBody);
  });
});// Import the necessary dependencies and modules for testing
const Bills = require('./Bills');
const Logout = require('../services/Logout');

// Mock the necessary dependencies
jest.mock('../services/Logout');

describe('Bills', () => {
  let bills;
  let documentMock;
  let onNavigateMock;
  let storeMock;
  let localStorageMock;

  beforeEach(() => {
    // Create mocks for the dependencies
    documentMock = {
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
    };
    onNavigateMock = jest.fn();
    storeMock = {};
    localStorageMock = {};

    // Create a new instance of Bills for each test
    bills = new Bills({
      document: documentMock,
      onNavigate: onNavigateMock,
      store: storeMock,
      localStorage: localStorageMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add event listener to buttonNewBill', () => {
    // Mock the buttonNewBill element
    const buttonNewBillMock = {
      addEventListener: jest.fn(),
    };
    documentMock.querySelector.mockReturnValue(buttonNewBillMock);

    // Call the constructor
    bills.constructor();

    // Verify that the event listener is added to buttonNewBill
    expect(buttonNewBillMock.addEventListener).toHaveBeenCalledWith(
      'click',
      bills.handleClickNewBill
    );
  });

  test('should add event listener to iconEye elements', () => {
    // Mock the iconEye elements
    const iconEyeMocks = [
      {
        addEventListener: jest.fn(),
      },
      {
        addEventListener: jest.fn(),
      },
    ];
    documentMock.querySelectorAll.mockReturnValue(iconEyeMocks);

    // Call the constructor
    bills.constructor();

    // Verify that the event listener is added to each iconEye element
    iconEyeMocks.forEach((iconEyeMock) => {
      expect(iconEyeMock.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });
  });

  test('should create a new instance of Logout', () => {
    // Call the constructor
    bills.constructor();

    // Verify that a new instance of Logout is created
    expect(Logout).toHaveBeenCalledWith({
      document: documentMock,
      localStorage: localStorageMock,
      onNavigate: onNavigateMock,
    });
  });
});