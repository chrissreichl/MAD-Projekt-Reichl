import React from "react";
import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Dimensions
} from "react-native";
import {
  Provider as PaperProvider,
  Card,
  Avatar,
  IconButton,
} from "react-native-paper";


import { NavigationStackProp } from 'react-navigation-stack';
import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute'
  },
  offlineText: {
    color: '#fff'
  }
});



const cardsArray = [
  {
    "cardName": "Jetzt im TV",
    "icon": "play",
    "iconColor": "blue",
    "navigateToPage": "tvProgramPage",
    "transferParams": {
      "title": "Jetzt im TV",
      "link": "https://www.tvspielfilm.de/tv-programm/rss/jetzt.xml"
    }

  }, {
    "cardName": "Heute, 20:15 Uhr im TV",
    "icon": "theater",
    "iconColor": "blue",
    "navigateToPage": "tvProgramPage",
    "transferParams": {
      "title": "Heute, 20:15 Uhr im TV",
      "link": "https://www.tvspielfilm.de/tv-programm/rss/heute2015.xml"
    }
  }, {
    "cardName": "Heute, 22:00 Uhr im TV",
    "icon": "clock",
    "iconColor": "blue",
    "navigateToPage": "tvProgramPage",
    "transferParams": {
      "title": "Heute, 22:00 Uhr im TV",
      "link": "https://www.tvspielfilm.de/tv-programm/rss/heute2200.xml"
    }
  }, {
    "cardName": "ORFeins",
    "icon": "television",
    "iconColor": "red",
    "navigateToPage": "ORFPage",
    "transferParams": {
      "title": "ORFeins",
      "link": "https://rss.orf.at/orfeins.xml"
    }
  }, {
    "cardName": "ORF2",
    "icon": "television",
    "iconColor": "red",
    "navigateToPage": "ORFPage",
    "transferParams": {
      "title": "ORF2",
      "link": "https://rss.orf.at/orf2.xml"
    }
  }
]


interface ListPageProps {
  navigation: NavigationStackProp<{}>;
  connectionInfo: NetInfoState | null;
}

export default class ListPage extends React.Component<ListPageProps> {
  _subscription: NetInfoSubscription | null = null;

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Fernsehprogramm",
      headerTintColor: '#000',
      headerStyle: {
        backgroundColor: "#DCDCDC"
      },
      headerRight: () => (
        <IconButton
          onPress={() => navigation.navigate('ImpressumPage')}
          color="#000"
          size={25}
          icon="information"
        />
      ),
    }
  };

  state = {
    data: cardsArray,
    connectionInfo: null
  };


  componentDidMount() {
    this._subscription = NetInfo.addEventListener(
      this._handleConnectionInfoChange
    );
  }


  componentWillUnmount() {
    this._subscription && this._subscription();
  }


  _handleConnectionInfoChange = (connectionInfo: NetInfoState) => {
    this.setState({ connectionInfo });
    //console.log(connectionInfo.isConnected);
    this.setState({ connectionInfo: connectionInfo.isConnected });
  };


  renderCardItem = ({ item }) => (
    <View style={{ paddingBottom: 16 }}>
      <CardItem
        name={item.cardName}
        icon={item.icon}
        iconColor={item.iconColor}
        onCardClicked={() => this.props.navigation.navigate(item.navigateToPage, { transferParams: item["transferParams"] })} //transferParams gives the informations from cardArray-> transferParams to the next page 
      />
    </View>
  );


  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0E0E0', }}>
        {!this.state.connectionInfo && <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Keine Internetverbindung</Text>
        </View>}
        <PaperProvider>
          <View
            style={{ padding: 16, marginTop: 10 }}
          >
            <FlatList
              ListEmptyComponent={() => <Text>Keine Daten gefunden</Text>}
              data={this.state.data}
              renderItem={this.renderCardItem}
              keyExtractor={(item, index) => index.toString()}
            />

            <View style={{ height: 16 }} />

          </View>
        </PaperProvider>
      </SafeAreaView>
    );
  }
}



interface ItemProps {
  name: string;
  icon: string;
  iconColor: string;
  onCardClicked(): void;
}

class CardItem extends React.Component<ItemProps> {
  render() {
    return (
      <>
        <Card onPress={this.props.onCardClicked}>
          <Card.Title
            title={this.props.name}
            left={props => <Avatar.Icon {...props} icon={this.props.icon} style={[{ backgroundColor: this.props.iconColor },
            ]} />}
          />
        </Card>
      </>
    );
  }
}

