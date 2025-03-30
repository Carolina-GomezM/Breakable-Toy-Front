import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductTable from '../tableProduct'
import dayjs from 'dayjs'

const mockProducts = [
  {
    id: 1,
    name: 'Product A',
    category: 'Electronics',
    price: 99.99,
    stock: 15,
    expDate: dayjs().add(20, 'day').format('YYYY-MM-DD')
  },
  {
    id: 2,
    name: 'Product B',
    category: 'Food',
    price: 5.99,
    stock: 3,
    expDate: dayjs().add(4, 'day').format('YYYY-MM-DD')
  },
  {
    id: 3,
    name: 'Product C',
    category: 'Clothing',
    price: 29.99,
    stock: 0,
    expDate: dayjs().add(10, 'day').format('YYYY-MM-DD')
  }
]

const mockOnEdit = vi.fn()
const mockOnDelete = vi.fn()
const mockHandleChk = vi.fn()
const mockHandleAllChecks = vi.fn()

describe('ProductTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('renders the table with products', () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )

    expect(screen.getByText('Product A')).toBeInTheDocument()
    expect(screen.getByText('Product B')).toBeInTheDocument()
    expect(screen.getByText('Product C')).toBeInTheDocument()
  })
  


  it('shows delete confirmation dialog', async () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])

    expect(screen.getByText('Are you sure you want to delete this product?')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )

    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])

    expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0])
  })

  it('handles delete confirmation correctly', async () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])

    const confirmButton = screen.getByText('Yes')
    await userEvent.click(confirmButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockProducts[0].id)
  })


  
})