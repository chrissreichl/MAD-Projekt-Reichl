import React from "react";
import { View } from "react-native";
import { Paragraph } from 'react-native-paper';





export default class ImpressumPage extends React.Component {

  static navigationOptions = {
    title: 'Impressum',
  };


  render() {
    return (
      <View style={{ margin: 20 }}>
        <Paragraph>Informationspflicht laut §5 E-Commerce Gesetz, §14 Unternehmensgesetzbuch, §63 Gewerbeordnung und Offenlegungspflicht laut §25 Mediengesetz. </Paragraph>

        <Paragraph style={{ marginTop: 20, marginBottom: 10, fontWeight: "bold", fontSize: 18 }}>Christian Reichl</Paragraph>
        <Paragraph style={{ marginTop: 10, marginBottom: 10 }}>{"Göttweiger-Straße 8 \n3131 Getzersdorf \nÖsterreich"} </Paragraph>
        <Paragraph style={{ marginTop: 10, marginBottom: 10 }}>{"Tel.: 01234/56789 \nFax: 01234/56789-0 \nE-Mail: se171010@fhstp.ac.at"} </Paragraph>
      </View>
    );
  }
}
