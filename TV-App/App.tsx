import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import ListPage from './pages/ListPage';
import ImpressumPage from './pages/ImpressumPage';
import FernsehprogrammPage from './pages/FernsehprogrammPage';
import NewsPage from './pages/NewsPage';
import tvProgramPage from './pages/tvProgramPage';
import ORFPage from './pages/ORFPage';




const AppNavigator = createStackNavigator({
  Home: {
    screen: ListPage,
  },
  ImpressumPage: {
    screen: ImpressumPage,
  },
  FernsehprogrammPage: {
    screen: FernsehprogrammPage,
  },
  NewsPage: {
    screen: NewsPage,
  },
  tvProgramPage: {
    screen: tvProgramPage,
  },
  ORFPage: {
    screen: ORFPage,
  }
});





export default createAppContainer(AppNavigator);
