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
  TableSortLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
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
  const [total, setTotal] = useState(0);

  const fetchSortedProducts = async () => {
    try {
      const params = new URLSearchParams();
      
      // Parámetros de ordenamiento
      if (primarySort) {
        params.append('primarySort', primarySort);
        params.append('primaryOrder', order);
      }
      
      if (secondarySort?.column) {
        params.append('secondarySort', secondarySort.column);
        params.append('secondaryOrder', secondarySort.order);
      }
      
      // Parámetros de paginación
      params.append('page', page.toString());
      params.append('size', rowsPerPage.toString());

      const response = await fetch(`http://localhost:9090/products/sorted?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const { data, total } = await response.json();
      
      setProducts(data || []);
      setTotal(total || 0);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchSortedProducts();
  }, [primarySort, secondarySort, order, page, rowsPerPage]);

  useEffect(() => {
    // Actualizar productos cuando cambia productsEdit
    fetchSortedProducts();
  }, [productsEdit]);

  const handleClose = () => {
    setOpen(false);
    setIdDel(null);
  };

  const handleOpen = (id: number) => {
    setIdDel(id);
    setOpen(true);
  };

  const handleDelete = () => {
    if (idDel !== null) {
      onDelete(idDel);
      fetchSortedProducts(); // Refrescar datos después de eliminar
    }
    handleClose();
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = products.map((product) => product.id);
    handleAllChecks(newSelected, event);
    if (event.target.checked) {
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    handleChk(id, event);
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

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

    const getRowStyle = (expDate: string | null, stock: number) => {
  const expirationDate = expDate ? dayjs(expDate) : null;
  let rowStyle = "inherit";

  if (expirationDate) {
  const diffInDays = expirationDate.diff(dayjs(), "day");
  if (diffInDays <= 7) {
  rowStyle = "lightcoral";
  } else if (diffInDays <= 14) {
  rowStyle = "lightgoldenrodyellow";
  } else {
  rowStyle = "lightgreen";
  }
  }

  const cellStyle = stock > 10 ? "inherit" : stock > 4 ? "#FBCEB1" : "#d34545";

  return { rowStyle, cellStyle };
  };
  return (
    <Paper>
      <TableContainer component={Paper} sx={{ marginTop: 4, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < products.length}
                  checked={selected.length === products.length && products.length > 0}
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
                    active={primarySort === column.id || secondarySort.column === column.id}
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
  {productsEdit.map((product) => {
    const { rowStyle, cellStyle } = getRowStyle(product.expDate, product.stock);

    return (
      <TableRow
        key={product.id}
        sx={{
          backgroundColor: rowStyle,
          textDecorationLine: product.stock === 0 ? "line-through" : "none",
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
        <TableCell>{"$" + product.price.toFixed(2)}</TableCell>
        <TableCell>{product.expDate || "N/A"}</TableCell>
        <TableCell sx={{ backgroundColor: cellStyle }}>{product.stock}</TableCell>
        <TableCell>
          <Button
            color="primary"
            variant="contained"
            size="small"
            sx={{ marginRight: "20px" }}
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => handleOpen(product.id)}
          >
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
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
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