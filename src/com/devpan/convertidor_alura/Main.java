package com.devpan.convertidor_alura;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        ApiRequest apiRequest = new ApiRequest();
        Scanner scanner = new Scanner(System.in);
        double monto;
        int cantidad;
        List<String> monedasPermitidas = Arrays.asList("ARS", "BOB", "BRL", "CLP", "COP", "USD", "MXN");


        while (true) {
            System.out.println("CONVERSOR DE MONEDAS\n");
            System.out.println("OPCIONES: ");
            System.out.println("1. Realizar una conversion de moneda");
            System.out.println("2. Salir\n");
            System.out.print("Ingrese una opcion: ");
            int opcion = scanner.nextInt();
            scanner.nextLine();

            switch (opcion) {
                case 1:
                    System.out.println("Las monedas disponibles son las siguientes elige una:\n");
                    System.out.println("Peso Argentino => ARS \nPeso Mexicano => MXN \nBoliviano => BOB" +
                            "\nReal Brasileño => BRL \nPeso Chileno => CLP \nPeso Colombiano => COP" +
                            "\nDolar Estadounidense => USD\n");

                    String monedaBase;
                    while (true) {
                        System.out.println("Ingresa una moneda base: ");
                        monedaBase = scanner.nextLine().toUpperCase();
                        if (monedasPermitidas.contains(monedaBase)) {
                            break;
                        } else {
                            System.out.println("Moneda base no permitida por favor usa una de las siguientes " + monedasPermitidas + "\n");
                        }
                    }


                    String monedaDestino;
                    while (true) {
                        System.out.println("Ingresa una moneda destino: ");
                        monedaDestino = scanner.nextLine().toUpperCase();
                        if (monedasPermitidas.contains(monedaDestino)) {
                            break;
                        } else {
                            System.out.println("Moneda base no permitida por favor usa una de las siguientes " + monedasPermitidas + "\n");
                        }
                    }


                    System.out.println("¿Que cantidad quieres convertir?");
                    cantidad = scanner.nextInt();

                    JsonNode datosPar = apiRequest.getDatosPar(monedaBase, monedaDestino);
                    if (datosPar != null && datosPar.has("conversion_rate")) {
                        System.out.println("\nLa tasa de conversion " + monedaBase + " a " + monedaDestino + " es de: "
                                + datosPar.get("conversion_rate").asDouble() + monedaDestino);

                        monto = cantidad * datosPar.get("conversion_rate").asDouble();
                        System.out.println(cantidad + monedaBase + " a " + monedaDestino + " equivalen a " + monto + monedaDestino +
                                "\n\n");

                    } else {
                        System.out.println("No se pudo obtener la tasa de conversion");
                    }
                    break;

                case 2:
                    System.out.println("Gracias por usar este conversor de monedas");
                    return;

                default:
                    System.out.println("Opcion no valida elige 1 o 2");
                    break;


            }
        }


    }

}
