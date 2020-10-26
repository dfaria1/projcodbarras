//CSpell:Ignore codigo, informacoes, obtem

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AntDesign } from '@expo/vector-icons'
import styled from 'styled-components/native'

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [codigo, setCodigo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [informacoes, setInformacoes] = useState();
  const [infosCapturadas, setInfosCapturadas] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setCodigo(data);
    obtemDados(data);
  };

  async function obtemDados(ean) {
    setCarregando(true)
    let url = `https://world.openfoodfacts.org/api/v0/product/${ean}.json`
    await fetch(url)
      .then(response => response.json())
      .then(dados => {
        setInformacoes(dados)
        setInfosCapturadas(true);
      })
      .catch(function (error) {
        alert(error.message)
      });
    setCarregando(false)
  }


  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Container>

      <ScannerArea>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.styledScanner}/>
        <View style={styles.linha}></View>
      </ScannerArea>

      <PageBody>
      {carregando && <LoadingIcon size="large" color="#000"/>}
        <Infos>
          {scanned && infosCapturadas &&
            <ScrollView>
            <Text style={styles.textoInfos} source={{ uri: informacoes }}>
              {informacoes.code.length > 0 ? `Código: ${informacoes.code}\n\n` : ""}
              {informacoes.product.generic_name_pt == null ? "" : `Produto: ${informacoes.product.generic_name_pt}\n\n`}
              {informacoes.product.quantity == null ? "" : `Quantidade: ${informacoes.product.quantity}\n\n`}
              {informacoes.product.ingredients_text_pt == null ? "" : `Ingredientes: ${informacoes.product.ingredients_text_pt}\n\n`}
              {informacoes.product.allergens_from_user == null ? "" : `Alergênicos: ${informacoes.product.allergens_from_user.replace(/,/g, ", ").replace(", .",", ").replace("(en) ","")}\n\n`}
              {informacoes.product.traces == "" ? "" : `Pode conter: ${informacoes.product.traces.replace(/en:/g, "").replace(/,/g,", ")}\n`}
              
            </Text>
            {informacoes.product.image_front_small_url == null ? false : <ImagemTabela style={{resizeMode: 'stretch',}}source={{uri: informacoes.product.image_front_small_url.replace(".200.",".full.")}}/>}
            {informacoes.product.image_ingredients_small_url == null ? false : <ImagemTabela style={{resizeMode: 'stretch',}}source={{uri: informacoes.product.image_ingredients_small_url.replace(".200.",".full.")}}/>}
            {informacoes.product.image_nutrition_small_url == null ? false : <ImagemTabela style={{resizeMode: 'stretch',}}source={{uri: informacoes.product.image_nutrition_small_url.replace(".200.",".full.")}}/>}
            </ScrollView>}
        </Infos>

        <Botoes>
          <TouchableOpacity style={styles.touch} onPress={() => setScanned(false)}>
            <Text style={styles.texto}>Novo Código</Text>
            <AntDesign name={`barcode`} size={50} color="#000" />
          </TouchableOpacity>
        </Botoes>
      </PageBody>

    </Container>
  );
}

const styles = StyleSheet.create({

  touch: {
    margin: 35,
    backgroundColor: "#AAA",
    padding: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    marginTop: 0,
    margin: 5,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },

  textoInfos: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    margin: 5,
  },

  linha: {
    padding: 60,
    borderBottomColor: "red",
    borderBottomWidth: 2,
    width: 600,
    marginRight: -50,
  },

  styledScanner: {
    position: 'absolute',
    top: -1000,
    bottom: 0,
    left: 0,
    right: 0,
  },

})

const Container = styled.SafeAreaView`
flex: 1;
background-color: #DDD;
`

const PageBody = styled.View`
flex-direction: column;
align-items: flex-end;
justify-content: center;
padding: 24px;
`

const ScannerArea = styled.View`
flex: 1;
`
const Botoes = styled.View`
flex: 1;
flex-direction: row;
align-items: flex-end;
justify-content: center;
margin-bottom: -40px;
margin-right: 100px;
`

const Infos = styled.View`
flex: 1;
flex-direction: row;
align-items: flex-end;
justify-content: center;
margin-top: -525px;
margin-bottom: -310px;
margin-left: -16px;
margin-right: -16px;
background-color: #CCB;
border-radius: 10px;
`

const ImagemTabela = styled.Image`
width: 95%;
height: 400px;
margin-left: 10px;
margin-right: 10px;
margin-bottom: 10px;
border-color: #FFF;
border-width: 2px;
`

const LoadingIcon = styled.ActivityIndicator`
position: absolute;
right: 187px;
bottom: 300px;
`