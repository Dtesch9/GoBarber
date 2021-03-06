import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationError';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();

  const navigation = useNavigation();

  const formRef = useRef<FormHandles>(null);
  const OldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const ConfirmPasswordInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),

          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),

          old_password: Yup.string(),

          password: Yup.string().when('old_password', {
            is: value => !!value.length,
            then: Yup.string()
              .required('Campo obrigatório')
              .min(6, 'Mínimo 6 dígitos'),
            otherwise: Yup.string(),
          }),

          password_confirmation: Yup.string()
            .when('old_password', {
              is: value => !!value.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
        });

        await schema.validate(data, { abortEarly: false });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        await updateUser(response.data);

        navigation.navigate('Dashboard');

        Alert.alert(
          'Perfil atualizado com sucesso!',
          'Suas informaçõas do perfil foram atualizadas com sucesso!',
        );
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização',
          'Ocorreu um erro ao atualizar perfil, tente novamente',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione um avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar câmera',
        chooseFromLibraryButtonTitle: 'Escolhar da galeria',
        permissionDenied: {
          title: 'Permissão para utilizar galeria',
          okTitle: 'Permitir',
          text: 'Permissão negada',
          reTryTitle: 'Tente novamente',
        },
      },
      async response => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert('Erro ao atualizar seu avatar', `${response.error}`);
          return;
        }

        const imageType = response.fileName?.split('.')[1];

        const data = new FormData();

        data.append('avatar', {
          uri: response.uri,
          name: `${user.id}-${response.fileName}`,
          type: `image/${imageType}`,
        });

        try {
          const apiResponse = await api.patch('/users/avatar', data, {
            headers: {
              'Access-Control-Allow-Methods': 'PATCH',
            },
          });

          updateUser(apiResponse.data);
        } catch (err) {
          Alert.alert('Ocorreu um erro', 'Tente novamente');
        }
      },
    );
  }, [user.id, updateUser]);
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Container>
            <BackButton onPress={handleGoBack} testID="go-back-button">
              <Icon name="chevron-left" size={28} color="#999591" />
            </BackButton>

            <UserAvatarButton
              onPress={handleUpdateAvatar}
              testID="user-avatar-button"
            >
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form
              initialData={user}
              ref={formRef}
              onSubmit={handleUpdateProfile}
            >
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => OldPasswordInputRef.current?.focus()}
              />

              <Input
                ref={OldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => ConfirmPasswordInputRef.current?.focus()}
              />

              <Input
                ref={ConfirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Confirmar mudanças
              </Button>
            </Form>
            <Button onPress={() => signOut()}>Logout</Button>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
