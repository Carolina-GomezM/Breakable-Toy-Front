import React, { useState, useEffect, ChangeEvent } from "react";
import { Box, Button, Modal, TextField, Typography, MenuItem } from "@mui/material";
import {Product} from './Product'
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs'; 
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {useForm, Controller} from 'react-hook-form'




interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  productEdit?: Product; 
  onSave: (product: Product) => void;
  categories: string[];
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, productEdit, onSave, categories }) => {
    const {register, handleSubmit, getValues, setValue, watch, trigger, formState:{errors}} =  useForm({
      defaultValues: {
          category: '',
          name: '',
          price: '',
          stock: '',
          newCat: ''
    }});
  const [product, setProduct]= useState<Product>(productEdit || {id:0, name: '', category:'', price: 0, expDate:'', stock: 0});
  const  [category, setCategory] = useState<string>('')
  const [newCategory, setNewCategory] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  useEffect(() => {
    setNewCategory("")
    setIsAddingCategory(false)
    setValue('newCat', '');
    
    if (productEdit) {
        setValue('category', productEdit.category);
        setValue('name', productEdit.name);
        setValue('price', (productEdit.price).toString());
        setValue('stock', (productEdit.stock).toString());
        setProduct(productEdit);
    } else {
        setValue('category', '');
        setValue('name', '');
        setValue('price', '');
        setValue('stock', '');
        setProduct({id:0, name: '', category:'', stock: 0, price: 0, expDate:''});
    }
}, [productEdit, open, setValue]);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name=== 'stock' ? (value === '' ? '' : Number(value)) : value,
    }));

  };

  const handleDateChange = (date: Dayjs | null) => {
    setProduct(prev => ({...prev, expDate: date ? date.format('YYYY-MM-DD') : ''}));
  }

  const handleNewCategoryChange = () => {
    setProduct(prev => ({...prev, category: newCategory}));

  }

  const onSubmit = (data: any) => {
    const { category, name, price,  stock } = product;


    if (!category || !name || price <= 0  || stock < 0) {
      alert("Por favor completa los campos correctamente.");
      return;
    }
    
    
    onSave(product); 
    setIsAddingCategory(false)
    onClose();
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === 'E'){
        e.preventDefault();
    }
  }

  const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d+$/.test(value) && value !== "") {
      e.preventDefault(); 
    }
  };



  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          {productEdit ? "Edit a Product" : "Add new Product"}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
        label="Category"
        select
        fullWidth
        value={isAddingCategory ? "newCat" : product.category}
        {...register ("category", {
                required: "Is required to select a category."
        })}
        onChange={(e) => {
            const value = e.target.value;
            if (value === "newCat") {
            setIsAddingCategory(true);
            } else {
            setIsAddingCategory(false);
            setProduct((prev) => ({ ...prev, category: value })); 
            }
        }}
        error={Boolean(errors.category)}
        sx={{ mb: 2 }}
        >
        <MenuItem value="" onClick={() =>setIsAddingCategory(false)}>Select</MenuItem>
        <MenuItem value="newCat">+ New Category</MenuItem>        
        {categories.map((category) => (
            <MenuItem key={category} value={category} onClick={() =>setIsAddingCategory(false)}>{category}</MenuItem>
        ))}

        </TextField>
        {errors.category?.message && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginBottom:"18px", display:'block' }}>{String(errors.category.message)}</span>
         )}
        {isAddingCategory && (
            <TextField
            label="New Category"
            fullWidth
            sx={{mb:2}}
            {...register("newCat", {
                required: isAddingCategory ? "This Field is required": false,
            })}
            onChange={(e) => {
                const value = e.target.value;
                setValue('newCat', value);
                setNewCategory(value);
                setProduct(prev => ({...prev, category: value}));
            }}
            error={Boolean(errors.newCat)}
        />
        )}
        {errors.newCat?.message && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginBottom:"18px", display:'block' }}>{String(errors.newCat.message)}</span>
         )}
        <TextField
          label="Name"
          fullWidth
          value={product.name}
          {...register("name",{
            required: "This field is required",
            maxLength: {
                value: 120,
                message: "The name has a maximum of 120 characters",
              },
          })}
          onChange={handleChange}
          error={Boolean(errors.name)}
          sx={{ mb: 2 }}
        />
        {errors.name?.message && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginBottom:"18px", display:'block' }}>{String(errors.name.message)}</span>
         )}
        <TextField
          label="Unit price"
          type="number"
          fullWidth
          value={product.price}
          {...register("price", {
            required: "This field is required",
            validate: (value) =>
                parseInt(value) > 0 || "The field must be greater than 0."
          })}
          onChange={handleChange}
          error={Boolean(errors.price)}
          onKeyDown={handleKeyDown}
          sx={{ mb: 2 }}
          inputProps={{ step: "0.01" }}
        />
         {errors.price?.message && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginBottom:"18px", display:'block' }}>{String(errors.price.message)}</span>
         )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Expiration Date"
          value={product.expDate ? dayjs(product.expDate) : null}
          onChange={handleDateChange}
          sx={{ mb: 2, width:'100%' }}
        />
        </LocalizationProvider>
        <TextField
          label="Stock"
          type="number"
          fullWidth
          value={product.stock}
          {...register("stock",{
            required: "This field is required",
            validate: {
                isInteger: (value) => {
                 if(!Number.isInteger(Number(value))){
                    return "The value must be an Integer"
                 }
                 if(Number(value) < 0 ){
                    return "The stock value cannot be negative."
                 }

                 return true;
                }}
          })}
          onInput={handleIntegerChange}
          error={Boolean(errors.stock)}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        {errors.stock?.message && (
            <span style={{ color: 'red', fontSize: '0.875rem', marginBottom:"18px", display:'block' }}>{String(errors.stock.message)}</span>
         )}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {productEdit ? "Update" : "Save"}
          </Button>
        </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ProductModal;