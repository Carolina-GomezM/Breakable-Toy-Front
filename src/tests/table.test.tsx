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

  it('handles sorting when clicking column headers', async () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )
    const getAllColumnCells = (columnIndex: number) => {
      const rows = screen.getAllByRole('row').slice(1) // Skip header row
      return rows.map(row => within(row).getAllByRole('cell')[columnIndex])
    }

    const nameHeader = screen.getByText('Name')
    await userEvent.click(nameHeader)
    const nameCells = getAllColumnCells(2)
    
    expect(nameCells[0]).toHaveTextContent('Product C')
    expect(nameCells[1]).toHaveTextContent('Product B')
    expect(nameCells[2]).toHaveTextContent('Product A')
  })

  it('renders products with correct styling based on stock levels', () => {
    render(
      <ProductTable
        productsEdit={mockProducts}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        handleChk={mockHandleChk}
        handleAllChecks={mockHandleAllChecks}
      />
    )

    const rows = screen.getAllByRole('row')
    
    const lowStockCell = within(rows[2]).getByText('3')
    expect(lowStockCell).toHaveStyle({ backgroundColor: 'darkcoral' })

    const zeroStockCell = within(rows[3]).getByText('0')
    expect(zeroStockCell).toHaveStyle({ textDecorationLine: 'line-through' })
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