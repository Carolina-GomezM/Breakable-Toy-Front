
import {Product, Report} from './Product'

export const obtainAllProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch('http://localhost:9090/products');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const products: Product[] = await response.json();
        console.log(products)
        return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }



};
export const addProduct = async (newProduct: Product): Promise<Product> => {
    try {
        delete (newProduct as any).id
        const response = await fetch('http://localhost:9090/products', {
            method:'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProduct)
        });
        
        const data = await response.json();
        return data;
    } catch(error){
        console.error(error);
        throw error;
    }

}

export const deleteProduct = async (id: number): Promise<{success: boolean}> => {
    try{
        const response = await fetch('http://localhost:9090/products/'+id, {
            method:'DELETE',
        });
        if (response.ok){
            return {success: true}
        } else{
            return {success: false}
        } 
    } catch(error){
        console.error(error);
        throw error;
    }

}

export const updateProduct = async (id: number, updatedProduct : Product): Promise<Product> => {
    try{
        const response = await fetch('http://localhost:9090/products/'+id, {
            method:'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct)
        });
        const data = await response.json();
        return data;
} catch(error){
    console.error(error);
    throw error;
}

}

export const setOutOfStock = async (id: number): Promise<{success: boolean}> => {
    try {
        const response = await fetch('http://localhost:9090/products/'+id+'/outofstock', {
            method:'POST'
        });
        if (response.ok){
            return {success: true}
        } else{
            return {success: false}
        } 
    } catch(error){
        console.error(error);
        throw error;
    }

}
export const setStock = async (id: number): Promise<{success: boolean}> => {
    try{
        const response = await fetch('http://localhost:9090/products/'+id+'/instock', {
            method:'PUT'
        });
        if (response.ok){
            return {success: true}
        } else{
            return {success: false}
        }
    } catch(error){
        console.error(error);
        throw error;
}

}

export const search = async (name?: string, categories?: string[], availability?: string): Promise<Product[]> => {

try{

    let uri = 'http://localhost:9090/products?';

    if(name){
        uri += "&name="+name
    }
    if(categories && categories.length > 0){
        uri += "&category="
        categories.forEach(category => {
            uri += category+","
        });
        uri = uri.slice(0, -1);

    }
    if(availability){
        uri += "&availability="+availability
    }



    const response = await fetch(uri, {
        method:'GET'
    });
    const data = await response.json();
    return data;
    } catch(error){
        console.error(error);
        throw error;
}

}

export const getAllCategories = async(): Promise<string[]> => {
    try{
        const response = await fetch('http://localhost:9090/products/categories',{
            method:'GET'
        })
        const data = await response.json();
        return data;
    } catch(error){
        console.error(error);
        throw error;
}
}

export const getReports = async(): Promise<Report[]> => {
    try{
        const response = await fetch('http://localhost:9090/products/summary',{
            method:'GET'
        })
        const data = await response.json();
        return data;
    } catch(error){
        console.error(error);
        throw error;
}
}



