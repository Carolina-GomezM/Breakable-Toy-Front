import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as api from '../api'

// Mock the entire api module
vi.mock('../api', () => ({
  obtainAllProducts: vi.fn(),
  addProduct: vi.fn(),
  deleteProduct: vi.fn(),
  updateProduct: vi.fn(),
  setStock: vi.fn(),
  setOutOfStock: vi.fn(),
  search: vi.fn(),
  getAllCategories: vi.fn(),
  getReports: vi.fn(),
}))

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Test Product',
    category: 'Electronics',
    price: 99.99,
    stock: 10,
    expDate: '2024-12-31'
  }
]

const mockCategories = ['Electronics', 'Food', 'Clothing']

const mockReports = [
  {
    category: 'Electronics',
    totalProductsInStock: 10,
    totalValueInStock: 999.90,
    averagePriceInStock: 99.99
  }
]

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(api.obtainAllProducts).mockResolvedValue(mockProducts)
    vi.mocked(api.getAllCategories).mockResolvedValue(mockCategories)
    vi.mocked(api.getReports).mockResolvedValue(mockReports)
  })

  it('renders initially with products, categories and reports', async () => {
    render(<App />)

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Product Management')).toBeInTheDocument()
    })

    // Verify API calls
    expect(api.obtainAllProducts).toHaveBeenCalled()
    expect(api.getAllCategories).toHaveBeenCalled()
    expect(api.getReports).toHaveBeenCalled()
  })

  it('opens modal for new product', async () => {
    render(<App />)
    
    const newProductButton = screen.getByText('New Product')
    await userEvent.click(newProductButton)

    expect(screen.getByText('Add new Product')).toBeInTheDocument()
  })

  it('handles product search', async () => {
    render(<App />)
    
    vi.mocked(api.search).mockResolvedValueOnce([mockProducts[0]])

    // Fill search form
    const nameInput = screen.getByLabelText('Name')
    await userEvent.type(nameInput, 'Test')

    // Click search button
    const searchButton = screen.getByText('Search')
    await userEvent.click(searchButton)

    expect(api.search).toHaveBeenCalledWith('Test', [], '')
  })

  it('handles category selection in search', async () => {
    render(<App />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })

    // Open category select
    const categorySelect = screen.getByLabelText('Category')
    await userEvent.click(categorySelect)

    // Select a category
    const option = screen.getByText('Electronics')
    await userEvent.click(option)

    // Search with selected category
    const searchButton = screen.getByText('Search')
    await userEvent.click(searchButton)

    expect(api.search).toHaveBeenCalledWith('', ['Electronics'], '')
  })

  it('handles availability filter', async () => {
    render(<App />)

    // Open availability select
    const availabilitySelect = screen.getByLabelText('Availability')
    await userEvent.click(availabilitySelect)

    // Select "In Stock"
    const option = screen.getByText('In Stock')
    await userEvent.click(option)

    // Search with availability filter
    const searchButton = screen.getByText('Search')
    await userEvent.click(searchButton)

    expect(api.search).toHaveBeenCalledWith('', [], 'in_stock')
  })

  it('adds a new product', async () => {
    const newProduct = {
      id: 2,
      name: 'New Product',
      category: 'Electronics',
      price: 199.99,
      stock: 5,
      expDate: '2024-12-31'
    }

    vi.mocked(api.addProduct).mockResolvedValueOnce(newProduct)
    
    render(<App />)

    // Open new product modal
    const newProductButton = screen.getByText('New Product')
    await userEvent.click(newProductButton)

    // Fill form
    const nameInput = screen.getByLabelText('Name')
    await userEvent.type(nameInput, 'New Product')

    const priceInput = screen.getByLabelText('Unit price')
    await userEvent.type(priceInput, '199.99')

    const stockInput = screen.getByLabelText('Stock')
    await userEvent.type(stockInput, '5')

    // Select category
    const categorySelect = screen.getByLabelText('Category')
    await userEvent.click(categorySelect)
    const option = screen.getByText('Electronics')
    await userEvent.click(option)

    // Save
    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    expect(api.addProduct).toHaveBeenCalled()
  })

  it('updates stock status', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Find and click checkbox
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(api.setOutOfStock).toHaveBeenCalledWith(mockProducts[0].id)
  })

  it('displays reports correctly', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Total Products in Stock')).toBeInTheDocument()
    })

    // Verify report data is displayed
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('999.90')).toBeInTheDocument()
  })

  it('handles form validation', async () => {
    render(<App />)

    // Open new product modal
    const newProductButton = screen.getByText('New Product')
    await userEvent.click(newProductButton)

    // Try to save without required fields
    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    // Check for validation messages
    expect(screen.getByText('Is required to select a category.')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('handles error cases', async () => {
    // Mock console.error to prevent error messages in test output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock API failure
    vi.mocked(api.obtainAllProducts).mockRejectedValueOnce(new Error('API Error'))

    render(<App />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })
})