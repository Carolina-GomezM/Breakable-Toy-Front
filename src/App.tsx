import {useForm, Controller} from 'react-hook-form'
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody, Typography, Box, Checkbox} from '@mui/material';
import TableProduct from './tableProduct'
import MyModalProps from './modal'
import { useEffect, useState } from 'react';
import ProductTable from './tableProduct';
import {Product, Report} from './Product'
import { addProduct, obtainAllProducts, deleteProduct, updateProduct, setStock, setOutOfStock, search, getAllCategories, getReports } from "./api";
type FormValues = {
  category?: string[];
}

function App(){


  const {register, handleSubmit, getValues, setValue, watch, formState:{errors}} =  useForm();
  const [open, setOpen] = useState(false);
  const[selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const selectedCategories = watch("category", []);
  const [reports, setReports] = useState<Report[]>([])
  const [booleanS, setBooleanS] = useState<boolean>(false)
  let [searchName, setSearchName] = useState<string>('')
  let [searchCat, setSearchCat] = useState<string[]>([])
  let [searchAv, setSearchAv] = useState<string>('')
  


  
  const handleCategories =  async () => {
    try{
      const data = await getAllCategories();
      setCategories(data);
    } catch(error) {
      console.error(error);
    }
  }

  const handleReports = async () => {
    try{
      const data = await getReports();
      setReports(data);
    } catch(error) {
      console.error(error);
    }
  }
  


  const handleOpenModal = () =>{
    setSelectedProduct(null);
    setOpen(true);
  }

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedProduct(null);
  }

  const openModalForEdit = (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const fetchProducts = async () => {
    try {
      if(booleanS){

        handleSearch(searchName, searchCat, searchAv);
      } else {

        const data = await obtainAllProducts();
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } 
  };

const delProduct = async(id: number) => {
  const response = await deleteProduct(id)
  if(response.success){
    alert("The product has been removed successfully.")
    fetchProducts();
    handleCategories();
    handleReports();
  }else{
    console.error("Error to delete the product")
  }
}

const handleAllChecks = async(ids: number[], event: React.ChangeEvent<HTMLInputElement>) => {
  const isChecked = event.target.checked;

  if (isChecked) {
    ids.forEach(async id => {
      await setOutOfStock(id)      
    });
  } else {
    ids.forEach(async id => {
      await setStock(id)   
    });
  }
  fetchProducts()
  fetchProducts()
  fetchProducts()
  handleReports();
}

const handleChk = async(id: number, event: React.ChangeEvent<HTMLInputElement>) => {
  const isChecked = event.target.checked;

    if (isChecked) {
      await setOutOfStock(id)
      fetchProducts()
      handleReports();
    } else {
      await setStock(id)
      fetchProducts()
      handleReports();

    }

}

const handleSearch = async(name?: string, category?: string[], availability?: string) => {
  setSearchName(watch("name"))
  setSearchAv(watch("availability"))
  setSearchCat(watch("category"))
  setBooleanS(true);
  const response = await search(name,category,availability);
  setProducts(response);
}



  const SaveProduct = async (product: Product) => {
    if(product.id){
      await updateProduct(product.id, product);
      fetchProducts();
      handleCategories();
      handleReports();
      alert("Updated product successfully")

    } else{
      const addedProduct = await addProduct(product)
      setProducts((prevProducts) => [...prevProducts, addedProduct]);
      fetchProducts();
      handleCategories();
      handleReports();
      alert("Added product successfully")
      console.log(product);
     
    }
  }

  useEffect(() => {
    handleReports();
    handleCategories();
    if(!booleanS){
      fetchProducts();
    }
  }, []);



  console.log(errors);

  const onSubmit = handleSubmit((data) => {console.log(data)})
  return (
    <Box padding={3}>
        <Typography variant="h4" gutterBottom>Inventory Management</Typography>


        {/* Form Section */}
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ marginBottom: 3 }}>
          <TextField
                    label="Name"
                   /*  value={searchName} */
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    {...register("name", {
                      maxLength: {
                        value: 120,
                        message: "The name has a maximum of 120 characters",
                      },
                    })}
                    error={Boolean(errors.name)}
                    />
                {errors.name?.message && (
                  <span style={{ color: 'red', fontSize: '0.875rem' }}>{String(errors.name.message)}</span>
                )}
            <FormControl fullWidth margin="normal" variant='outlined'>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    multiple
                    value={selectedCategories || []}
                    label="Category"
                    {...register("category")}
                    onChange={(event) => setValue("category", event.target.value as string[])}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" variant='outlined'>
                <InputLabel id="availability-label">Availability</InputLabel>
                <Select
                    labelId="availability-label"
                    defaultValue=""
                    label="Availability"
                    {...register("availability")}
                    >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    <MenuItem value="All">All</MenuItem>
                </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="primary" onClick={() => {
              const {name,category, availability} = getValues();
              handleSearch(name,category,availability);
            }}>Search</Button>
        </Box>

        {/* New Product Button */}
        <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpenModal}
            sx={{ marginBottom: 3 }}
            >
            New Product
        </Button>
          
          <TableProduct productsEdit={products} onEdit={openModalForEdit} onDelete={delProduct} handleChk={handleChk} handleAllChecks={handleAllChecks}/>

        <MyModalProps open={open} onClose={handleCloseModal} productEdit ={selectedProduct || undefined} onSave={SaveProduct} categories={categories}/>



       {/* Summary Table */}
       <Table sx={{marginTop:4, boxShadow:3}}>
                <TableHead>
                    <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Total Products in Stock</TableCell>
                        <TableCell>Total Value</TableCell>
                        <TableCell>Average Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report=> (
                     <TableRow key={report.category}>
                     <TableCell>{report.category}</TableCell>
                     <TableCell>{report.totalProductsInStock}</TableCell>
                     <TableCell>{report.totalValueInStock.toFixed(2)}</TableCell>
                     <TableCell>{report.averagePriceInStock.toFixed(2)}</TableCell>
                 </TableRow>
                  ))}
                </TableBody>
            </Table>

    </Box>
);
}


export default App