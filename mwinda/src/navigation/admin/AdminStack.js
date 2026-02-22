// AdminStack.js
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabs from './AdminTabs';
import UserDetailsScreen from '../../Screens/admin/AdminCrudUsersDetails/UserDetailsScreen/UserDetailsScreen';
import EditUserScreen from '../../Screens/admin/AdminCrudUsersDetails/EditUserScreen/EditUserScreen';

const Stack = createStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal', // Remplace 'mode="modal"' pour v6
        gestureEnabled: true,
        cardOverlayEnabled: true,
        cardStyle: { 
          backgroundColor: 'white',
          marginTop: 50,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20
        }
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="EditUser" component={EditUserScreen} />
    </Stack.Navigator>
  );
};

export default AdminStack;