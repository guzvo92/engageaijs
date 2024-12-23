
//import fs from 'fs';
//import fs from "fs/promises";
import { promises as fs } from 'fs';
//import fs, { read } from "fs";

export function when(datex=null) {
	let date =null
	if(datex){
		date = datex;
	}
	else{
		date = new Date();
	}
	
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // Los meses comienzan en 0, por lo que sumamos 1
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	const res = {
		date: date,
		year: year,
		month: month,
		day: day,
		hour: hours,
		minute: minutes,
		second: seconds,
		created_at_form: `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`,
		created_at_formDoc: `${day}_${month}_${year}__${hours}_${minutes}_${seconds}`
	};

	return res;
}

export function parseBlocktime(blocktime: number) {
    const date = new Date(blocktime * 1000); // Convertir a milisegundos
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Los meses comienzan en 0, por lo que sumamos 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const res = {
        date: date,
        year: year,
        month: month,
        day: day,
        hour: hours,
        minute: minutes,
        second: seconds,
        created_at_form: `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`
    };

    return res;
}

export async function makedir(fullpath:string) {
  try {
    await fs.mkdir(fullpath, { recursive: true });
    //console.log(`Directorio ${fullpath} creado correctamente`);
  } catch (err) {
    console.error("Error al crear el directorio:", err);
  }
}

export async function deletefile(fullpath:string) {
  try {
    await fs.unlink(fullpath);
    //console.log(`Archivo ${fullpath} eliminado correctamente`);
  } catch (err) {
    console.error("Error al eliminar el archivo:", err);
  }
}

export async function fileExists(ruta:string) {
  try {
    await fs.access(ruta);
    return true; // El archivo existe
  } catch {
    return false; // El archivo no existe
  }
}

export function parsetimestamp(date: number) {
  const d = new Date(date * 1000);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan en 0
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');
  const millisecond = d.getMilliseconds(); // Milisegundos no necesitan padding
  const yearmonthday = `${year}_${month}_${day}`;

  return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      yearmonthday,
      fullDate: `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`,
  };
}

export async function makefile_custom(jsonData: any, fullpath: string) {
    const logData = JSON.stringify(jsonData, null, 2);
    try {
      await fs.writeFile(fullpath, logData);
      //console.log(`Archivo ${fullpath} generado correctamente`);
    } catch (err) {
      console.error("Error write file:", err);
    }
}

// Corrigiendo readjson para devolver una promesa con async/await
export async function readjson(filepath:string, legend:string|null = null) {
    try {
      const jsonString = await fs.readFile(filepath, 'utf8');
      const json = JSON.parse(jsonString);
      //console.log(json);
      return json;
    } catch (err) {
      if(legend){
        console.error(legend,"Error reading or parsing file:", err);
      }
      else{
        console.error("Error reading or parsing file:", err);
      }
      return null; // Manejo de errores, retorna null en caso de error
    }
  }

export async function appendLineToFile(filepath: string, line: string, legend: string | null = null): Promise<boolean> {
    try {
        // Appends the line to the file with a newline at the end
        await fs.appendFile(filepath, `${line}\n`, 'utf8');
        return true; // Return true if the operation is successful
    } catch (err) {
        if (legend) {
            console.error(legend, "Error appending to file:", err);
        } else {
            console.error("Error appending to file:", err);
        }
        return false; // Return false if there is an error
    }
}


export async function readraw(filepath:string) {
  try {
    const data = await fs.readFile(filepath, "utf8");
    //console.log("Asynchronous read: " + data);
    return data;
  } catch (err) {
    console.error("Error read file:", err);
  }
}

export async function readallfilesindir(filepath:string) {
  try {
    const files = await fs.readdir(filepath);
    //for (const file of files) {
      //console.log(file);
    //}
    return files;
  } catch (err) {
    console.error("Error read dir:", err);
  }
}

export async function readallfilesindir_sortednum(filepath:string) {
  // Lee los archivos en la carpeta
  let archivos = await fs.readdir(filepath);

  // Ordena los archivos numéricamente según el número que sigue a 'd'
  archivos.sort((a:any, b:any) => {
      // Extrae el número después de la 'd'
      let numeroA = parseInt(a.replace('d', ''), 10);
      let numeroB = parseInt(b.replace('d', ''), 10);

      return numeroA - numeroB; // Orden numérico
  });

  return archivos;
}