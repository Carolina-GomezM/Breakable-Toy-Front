import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Button,
  TableSortLabel, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText 
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { Product } from './Product';
import dayjs from "dayjs";

interface TableProps {
  productsEdit: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  handleChk: (id: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAllChecks: (id: number[], event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductTable: React.FC<TableProps> = ({ productsEdit, onEdit, onDelete, handleChk, handleAllChecks }) => {
  const [open, setOpen] = useState(false);
  const [idDel, setIdDel] = useState<number | null>(null);  
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [primarySort, setPrimarySort] = useState<keyof Product | null>("name");
  const [secondarySort, setSecondarySort] = useState<{
    column: keyof Product | null;
    order: "asc" | "desc";
  }>({ column: null, order: "asc" });
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setProducts(productsEdit);
  }, [productsEdit]);

  // FUNCTIONS FOR DELETE A PRODUCT

  const handleClose = () => {
    setOpen(false)
    setIdDel(null);
  }

  const handleOpen = (id: number) => {
    setIdDel(id);
    setOpen(true);
  }

  const handleDelete = () => {
    if (idDel !== null){
      onDelete(idDel)
    }

    handleClose();
  }

  // PRODUCT SELECTION MANAGEMENT
  const handleSelectAllClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSelected = products.map((product) => product.id);
    handleAllChecks(newSelected, event)
    if (event.target.checked) {
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  // HANDLING INDIVIDUAL CHECKBOX SLECTION/ UNCHECKING
  const handleCheckboxChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    handleChk(id, event)
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // FUNCTION TO HANDLE THE ORDER OF COLUMNS
  const handleSort = (column: keyof Product) => {
    if (primarySort === column) {
      if (order === "desc") {
        setPrimarySort(null);
        setOrder("asc");
      } else {
        setOrder(order === "asc" ? "desc" : "asc");
      }
    } else if (secondarySort.column === column) {
      if (secondarySort.order === "desc") {
        setSecondarySort({ column: null, order: "asc" });
      } else {
        setSecondarySort({
          column,
          order: secondarySort.order === "asc" ? "desc" : "asc",
        });
      }
    } else if (!primarySort) {
      setPrimarySort(column);
      setOrder("asc");
    } else {
      setSecondarySort({ column, order: "asc" });
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const compare = (key: keyof Product, order: "asc" | "desc", a: Product, b: Product) => {
      const dir = order === "asc" ? 1 : -1;
      if (key === "name" || key === "category") {
        return a[key].localeCompare(b[key]) * dir;
      } else if (key === "price" || key === "stock") {
        return (a[key] - b[key]) * dir;
      } else if (key === "expDate") {
        return (
          new Date(a[key]).getTime() - new Date(b[key]).getTime()
        ) * dir;
      }
      return 0;
    };

    const primaryComparison = primarySort ? compare(primarySort, order, a, b) : 0;
    if (primaryComparison !== 0 || !secondarySort.column) return primaryComparison;
    return compare(secondarySort.column, secondarySort.order, a, b);
  });

  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  return (
    <Paper>
      <TableContainer component={Paper} sx={{marginTop:4, boxShadow:3}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < products.length
                  }
                  checked={
                    selected.length === products.length && products.length > 0
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {[
                { id: "category", label: "Category" },
                { id: "name", label: "Name" },
                { id: "price", label: "Price" },
                { id: "expDate", label: "Expiration Date" },
                { id: "stock", label: "Stock" },
              ].map((column) => (
                <TableCell key={column.id}>
                  <TableSortLabel
                    active={
                      primarySort === column.id || secondarySort.column === column.id
                    }
                    direction={
                      primarySort === column.id
                        ? order
                        : secondarySort.column === column.id
                        ? secondarySort.order
                        : "asc"
                    }
                    onClick={() => handleSort(column.id as keyof Product)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {paginatedProducts.map((product) => {
   
   const expirationDate = product.expDate ? dayjs(product.expDate) : null;
    let rowStyle = 'inherit'; 
    if (expirationDate) {
      const diffInDays = expirationDate.diff(dayjs(), 'day');
      if (diffInDays <= 7) {
        rowStyle = 'lightcoral'; 
      } else if (diffInDays <= 14) {
        rowStyle = 'lightgoldenrodyellow'; // Expira entre 1 y 2 semanas
      } else {
        rowStyle = 'lightgreen'; // Expira en más de 2 semanas
      }
    }

    let cellStyle
    if(product.stock > 10){
      cellStyle = 'inherit'
    } else if(product.stock > 4) {
      cellStyle = '#FBCEB1'
    } else if(product.stock < 5){
      cellStyle = '#d34545'
    } 

    return (
          <TableRow
            key={product.id}
            sx={{
              backgroundColor:rowStyle,
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                checked={selected.includes(product.id)}
                onChange={(e) => handleCheckboxChange(product.id, e)}
              />
            </TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.price.toFixed(2)}</TableCell>
            <TableCell>{product.expDate || "N/A"}</TableCell>
            <TableCell sx={{
              backgroundColor: cellStyle,
              textDecorationLine: product.stock == 0 ? 'line-through' : 'none'
            }}>{product.stock}</TableCell>
            <TableCell>
              <Button color="primary" variant="contained" size="small" sx={{marginRight:'20px'}} onClick={() => onEdit(product)}>
                Edit
              </Button>
              <Button color="error" variant="contained" size="small"  onClick={() => handleOpen(product.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={products.length}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={10}
        rowsPerPageOptions={[]}
      />

      <Dialog
              open={open}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Are you sure you want to delete this product?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  Once the product is deleted it cannot be recovered.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>No</Button>
                <Button onClick={handleDelete}>Yes</Button>
              </DialogActions>
            </Dialog>
    </Paper>
  );
};

export default ProductTable;