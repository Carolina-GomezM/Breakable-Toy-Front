import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductModal from '../modal'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

// Mock props
const mockOnClose = vi.fn()
const mockOnSave = vi.fn()
const mockCategories = ['Electronics', 'Food', 'Clothing']
const mockProduct = {
  id: 1,
  name: 'Test Product',
  category: 'Electronics',
  price: 99.99,
  stock: 10,
  expDate: '2024-12-31'
}

// Wrapper component for LocalizationProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    {children}
  </LocalizationProvider>
)

describe('ProductModal', () => {
  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSave.mockClear()
  })

  it('renders add product form when no product is provided', () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    expect(screen.getByText('Add new Product')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Unit price')).toHaveValue(0)
    expect(screen.getByLabelText('Stock')).toHaveValue(0)
  })

  it('renders edit product form with product data', () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
        productEdit={mockProduct}
      />,
      { wrapper }
    )

    expect(screen.getByText('Edit a Product')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue(mockProduct.name)
    expect(screen.getByLabelText('Unit price')).toHaveValue(mockProduct.price)
    expect(screen.getByLabelText('Stock')).toHaveValue(mockProduct.stock)
  })

  it('validates required fields', async () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    expect(await screen.findByText('Is required to select a category.')).toBeInTheDocument()
    expect(await screen.findByText('This field is required')).toBeInTheDocument()
  })

  it('handles new category addition', async () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    const categorySelect = screen.getByLabelText('Category')
    await userEvent.click(categorySelect)
    await userEvent.click(screen.getByText('+ New Category'))

    const newCategoryInput = screen.getByLabelText('New Category')
    await userEvent.type(newCategoryInput, 'New Test Category')

    expect(newCategoryInput).toHaveValue('New Test Category')
  })

  it('validates price must be greater than 0', async () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    const priceInput = screen.getByLabelText('Unit price')
    await userEvent.type(priceInput, '0')

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)

    expect(await screen.findByText('The field must be greater than 0.')).toBeInTheDocument()
  })



  it('successfully submits form with valid data', async () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    // Fill in form fields
    await userEvent.click(screen.getByLabelText('Category'))
    await userEvent.click(screen.getByText('Electronics'))
    await userEvent.type(screen.getByLabelText('Name'), 'New Product')
    await userEvent.type(screen.getByLabelText('Unit price'), '99.99')
    await userEvent.type(screen.getByLabelText('Stock'), '10')

    // Submit form
    await userEvent.click(screen.getByText('Save'))

    expect(mockOnSave).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when cancel button is clicked', async () => {
    render(
      <ProductModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        categories={mockCategories}
      />,
      { wrapper }
    )

    await userEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})