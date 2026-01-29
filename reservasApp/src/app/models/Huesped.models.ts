//Definir las interfaces que coincidan con las propiedades de los dto  del backend (por sus request y responses)

export interface HuespedRequest{
 nombre: string,
 apellido: string,
 email: string,
 telefono: string,
 documento: string

}

export interface HuespedResponse{
 id: number,
 nombre: string,
 apellido: string,
 email: string,
 telefono: string,
 documento: string

}