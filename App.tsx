import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, ButtonProps, FlatList, Alert } from 'react-native'
import { NavigationContainer, NavigationRouteContext, useNavigation, useFocusEffect } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
// import ImagePicker, {launchImageLibrary} from 'react-native-image-picker';
// import storage from '@react-native-firebase/storage';
// import moment from 'moment';
// import { format } from 'date-fns';

const firebaseConfig = {
  apiKey: "AIzaSyCp602UfXgeY9fcDvxWqBzrLxFxbWMQZyg",
  authDomain: "petperdido-4ba12.appspot.com",
  databaseURL: "https://seu-projeto.firebaseio.com",
  projectId: "petperdido-4ba12",
  storageBucket: "petperdido-4ba12.appspot.com",
  appId: "1:1071643733787:android:020b615c3c5945be8f6dbe",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

type Props = {
  navigation: StackNavigationProp<any>;
};
interface PublicacaoProps {
  dados: {
    Email: string;
    Senha: string;
    Telefone: string; // Substitua 'any' pelo tipo apropriado, se possível
    // ... outros campos que 'dados' possa ter
  };
}

export default function App(){
  return(
    <NavigationContainer>
      <MyStack/>
      {/* <CriarPublicacao></CriarPublicacao> */}
    </NavigationContainer>
  );
}

function Lobby({ navigation }: Props) {
  return (
    <View style={styles.lobbyContainer}>
      <View style={styles.header}>
        <View style={styles.logobox2}>
          <Image
            source={require('./src/assets/logopetperdido.png')}
            style={styles.headerLogo}
          />
          <View style={styles.botaoConversar}>
            <Button title="Criar" color="#BDA8B6" onPress={() =>navigation.navigate('CriarPubli')}/>
          </View>
        </View>
      </View>
      <View style={styles.containerFeed}>
        {/* <Publicacao></Publicacao>
        <Publicacao></Publicacao> */}
        <ListaDePublicacoes></ListaDePublicacoes>
      </View>
    </View>
  );
}

const ListaDePublicacoes = () => {
  interface Usuario {
    id: string;
    AutorId?: string;
    Descricao?: string;
    Telefone?: string;
    Email?: string;
    // Inclua outros campos conforme necessário
  }
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const fetchUsers = async () => {
    try {
      const usersCollection = await firestore().collection('Publicacao').get();
      const users = usersCollection.docs.map(doc => {
        return {id: doc.id, ...doc.data()};
      });
      setUsuarios(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, []),
  );


  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      decelerationRate="fast"
      data={usuarios}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <View style={styles.containerPubli}>
          <View style={styles.boxImagemPerfil}>
            <Image
              source={require('./src/assets/fotoperfil.jpg')}
              style={styles.imagemPerfil}
            />
            <Text style={styles.autor}>{item.Email}</Text>
          </View>

          <Text style={styles.conteudo}>{item.Descricao}</Text>

          <View style={styles.boxImagemPubli}>
            <Image
              source={require('./src/assets/cachorroperdido.jpg')}
              style={styles.imagemPubli}
            />
          </View>

          {/* <View style={styles.botaoConversar}>
            <Button title="Conversar" color="red" />
          </View> */}

          {/* <Text style={styles.data}>{item.DataCriacao}</Text> */}
        </View>
      )}
    />
  );
};


function Chat() {
  return (
    <View style={styles.lobbyContainer}>
      <View style={styles.header}>
          <View style={styles.logobox2}>
            <Image
              source={require("./src/assets/logopetperdido.png")}
              style={styles.headerLogo}
            />
        <View style={styles.botaoConversar}>
          <Button
            title='Voltar'
            color="red"
          />
        </View>
        </View>
      </View>
      <View style={styles.containerFeed}>
        {/* <Publicacao></Publicacao>
        <Publicacao></Publicacao> */}
      </View>
    </View>
  );
}

function CriarPublicacao({navigation}: Props) {
  const [desc, setDesc] = useState('');

  const enviarPubli = () => {
    const user = auth().currentUser;
    if (user) {
      if (!desc.trim()) {
        Alert.alert('Erro', 'A descrição não pode estar vazia.');
        return;
      }
      const userId = user.uid;
      const userEmail = user.email;

      firestore()
        .collection('Publicacao')
        .add({
          Descricao: desc,
          AutorId: userId,
          Email: userEmail,
        })
        .then(() => {
          Alert.alert('Sucesso', 'Publicação criada com sucesso!');
          console.log('Publicacao criada!');
          navigation.navigate('Feed');
        })
        .catch(error => {
          console.error('Erro ao criar publicacao: ', error);
        });
    } else {
      navigation.navigate('Login');
      console.log('Nenhum usuário logado.');
      // Lide com a situação de não haver usuário logado
    }
    
  };

  return (
    <View style={styles.container}>
      <View style={styles.logobox}>
        <Image
          source={require('./src/assets/logopetperdido.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Crie sua publicação</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Descricao</Text>
        <TextInput
          placeholder="Informe sobre o local, raça etc..."
          style={styles.inputDescricao}
          value={desc}
          multiline
          numberOfLines={4}
          onChangeText={setDesc}
          maxLength={128}
        />
        <View style={styles.buttonLogin}>
          <Button title="Publicar" color="#BDA8B6" onPress={enviarPubli} />
        </View>
        <View style={styles.buttonLogin}>
          <Button
            title="Voltar ao lobby"
            color="#BDA8B6"
            onPress={() => navigation.navigate('Feed')}
          />
        </View>
      </View>
    </View>
  );
}

function LoginUser({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  // const navigation = useNavigation();

  const enviarLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, senha)
      .then(() => {
        console.log('Usuário logado com sucesso!');
        navigation.navigate('Feed');
        // Navegar para a próxima tela ou mostrar sucesso
      })
      .catch(error => {
        Alert.alert(
          "Erro de Login",
          "Ocorreu um erro durante o login",
          [{ text: "OK" }]
        );
        console.error('Erro ao fazer login: ', error);
        console.log(email, senha)
        // Mostrar erro ao usuário
      });
  };

  return(
    <View style={styles.container}>
      <View style={styles.logobox}>
        <Image
        source={require("./src/assets/logopetperdido.png")}
        style={styles.logo}
        />
      </View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Seja Bem-vindo!</Text>
        <Text style={styles.welcomeSubtitle}>Aqui voce encontra o seu pet</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>E-mail</Text>
        <TextInput
          placeholder='Digite seu e-mail'
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.formTitle}>Senha</Text>
        <TextInput
          placeholder='Digite sua senha'
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <View style={styles.buttonLogin}>
          <Button
            title='Login'
            color="#BDA8B6"
            onPress={enviarLogin}
          />
        </View>
        <View style={styles.buttonLogin}>
          <Button
            title='Criar conta'
            color="#BDA8B6"
            onPress={() =>navigation.navigate('Cadastro')}
          />
        </View>
      </View>
    </View>
  );
}

function RegisterUser({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  const enviarInput = () => {
    auth()
      .createUserWithEmailAndPassword(email, senha)
      .then(userCredential => {
        userCredential.user.updateProfile({
          displayName: 'Nome do Usuário',
        });

        firestore().collection('usuarios').doc(userCredential.user.uid).set({
          Email: email,
          Senha: senha,
          Telefone: telefone,
        });

        console.log('Usuário registrado!');
        navigation.navigate('Feed')
      })
      .catch(error => {
        Alert.alert(
          "Erro de Login",
          "Senha incorreta ou usuário nao encontrado: " + error.message,
          [{ text: "OK" }]
        );
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logobox}>
        <Image
          source={require('./src/assets/logopetperdido.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Crie sua conta!</Text>
        <Text style={styles.welcomeSubtitle}>Aqui voce encontra o seu pet</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>E-mail</Text>
        <TextInput
          placeholder="Digite seu e-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.formTitle}>Telefone</Text>
        <TextInput
          placeholder="Digite seu número de telefone"
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
        />

        <Text style={styles.formTitle}>Senha</Text>
        <TextInput
          placeholder="Digite sua senha"
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <View style={styles.buttonLogin}>
          <Button title="Cadastrar" color="#BDA8B6" onPress={enviarInput} />
        </View>
        <View style={styles.buttonLogin}>
          <Button
            title="Já possui cadastro?"
            color="#BDA8B6"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </View>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => null, // Retorna null para tabBarIcon
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 18, // Ajuste o estilo do texto aqui
          paddingTop:13,
          backgroundColor: '#F3E9D6',
          width:'100%',
          height: '102%',
        },
        tabBarActiveTintColor: '#cf4aa3', // Cor do botão ativo
        tabBarInactiveTintColor: 'gray',  // Cor do botão inativo
        
      })}
    >
      <Tab.Screen name="Login" component={LoginUser} />
      <Tab.Screen name="Cadastro" component={RegisterUser} />
      <Tab.Screen name="Feed" component={Lobby} />
      <Tab.Screen name="Chat" component={Chat} />
    </Tab.Navigator>
  );
}

function MyStack() {
  return (
    <Stack.Navigator initialRouteName="Cadastro"
    screenOptions={({ route }) => ({
      tabBarIcon: () => null, // Retorna null para tabBarIcon
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 18, // Ajuste o estilo do texto aqui
        paddingTop:13,
        backgroundColor: '#F3E9D6',
        width:'100%',
        height: '102%',
      },
      tabBarActiveTintColor: '#cf4aa3', // Cor do botão ativo
      tabBarInactiveTintColor: 'gray',  // Cor do botão inativo
      
    })}>
      <Stack.Screen name="Login" component={LoginUser} />
      <Stack.Screen name="Cadastro" component={RegisterUser} />
      <Stack.Screen name="Feed" component={Lobby} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="CriarPubli" component={CriarPublicacao} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#F3E9D6",
    padding:35,
  },
  logobox:{
    justifyContent:'center',
    alignItems:'center',
    height:100,
    marginTop:0,
    marginBottom:50,
  },
  logo:{
    width:200,
    height:140,
  },
  welcome:{
    justifyContent:'flex-start',
    height:90,
  },
  welcomeTitle:{
    fontSize:25,
    fontWeight:'300',
    color:'#726E65'
  },
  welcomeSubtitle:{
    fontSize:13,
    fontWeight:'300',
    color:'#BDA8B6'
  },
  form:{
  },
  formTitle:{
    fontWeight:'400',
    fontSize:17,
  },
  input:{
    color:'#3b3b3b',
    width: '100%',
    height: 40,
    padding:7,
    marginTop:6,
    marginBottom:15,
    borderRadius:2,
    backgroundColor:'#fff',
  },
  inputDescricao:{
    color:'#3b3b3b',
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    textAlign: 'left',
    padding:3,
    marginTop:6,
    marginBottom:15,
    borderRadius:2,
    backgroundColor:'#fff',
  },
  buttonLogin:{
    backgroundColor:'#cf4aa3',
    color:'black',
    borderRadius:10,
    marginBottom:25,
  },
  header:{
    height: 90,
    // backgroundColor: "#e3d9c5",
    margin:-35,
  },
  logobox2:{
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:100,
    marginLeft:20,
    marginRight:20,
    marginTop:0,
    marginBottom:50,
  },
  headerLogo:{
    justifyContent:'center',
    alignItems:'center',
    height:50,
    width:100,
  },
  lobbyContainer:{
    flex:1,
    backgroundColor:"#F3E9D6",
    padding:35,
  },
  containerPubli: {
    borderRadius:10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom:10,
    // borderBottomWidth:1,
    // borderBottomColor: 'gray',
    // borderRadius:0,
  },
  autor: {
    color: 'black',
    fontSize: 16,
  },
  conteudo: {
    marginTop: 5,
  },
  data: {
    marginTop: 0,
    fontSize: 12,
    color: 'black',
  },
  containerFeed:{
    padding: 0,
    margin:0,
    marginTop: 40,
    width: 'auto',
  },
  boxImagemPubli:{
    paddingTop: 10,
    paddingBottom: 10,
  },
  imagemPubli:{
    width: 200,
    height: 100,
    borderRadius: 10,
  },
  boxImagemPerfil:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:10,
  },
  imagemPerfil:{
    width: 30,
    height: 30,
    borderRadius: 33,
    marginRight: 10,
  },
  botaoConversar:{
    height:'auto',
    width:100,
    marginBottom:10,
    marginTop:5,
    fontSize:10,
    color:'black',
    borderRadius:20,
  },
})