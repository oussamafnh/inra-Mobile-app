import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Div, Input, Button, Text, Header, Icon } from 'react-native-magnus';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

const AddChercheurPage = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [codeCentre, setCodeCentre] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddChercheur = async () => {
        if (!fullName || !password || !codeCentre || !code) {
            setErrorMessage('Veuillez remplir tous les champs.');
            return;
        }

        try {
            setLoading(true);
            setErrorMessage('');
            const storedToken = await getItem('authToken');

            if (!storedToken) {
                router.push('/auth');
                setLoading(false);
                return;
            }

            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/chercheurs`, {
                fullName,
                password,
                codeCentre,
                code,
            }, {
                headers: { Authorization: `Bearer ${storedToken}` },
            });

            if (response.data.message === "Un utilisateur existe déjà avec ce nom.") {
                setErrorMessage('Un utilisateur existe déjà avec ce nom.');
                setLoading(false);
            }
            if (response.data.message === "Un utilisateur existe déjà avec ce code et codeCentre.") {
                setErrorMessage('Un utilisateur existe déjà avec ce code et codeCentre.');
                setLoading(false);
            }
            if (response.data.message === "User not found" || response.data.message === "No auth token provided") {
                router.push('/auth');
                setLoading(false);
            }
            if (response.data.message === "Chercheur créé avec succès") {
                setSuccessMessage('Chercheur ajouté avec succès!');
                setLoading(false);
                setTimeout(() => {
                    router.push('/admin/listchercheur');
                }, 1000);
            }

        } catch (error) {
            console.error('Erreur lors de l\'ajout du chercheur :', error);
            setErrorMessage('Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    return (
        <Div flex={1} justifyContent="center" w="100%" alignItems="center" p="xl">
            <Header
                p="lg"
                borderBottomWidth={1}
                borderBottomColor="gray200"
                alignment="center"
                position="absolute"
                top={0}
                left={0}
                right={0}
                zIndex={10}
                bg="white"
                prefix={
                    <Button bg="transparent" onPress={() => router.back()}>
                        <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
                    </Button>
                }
            >
                Ajouter Un Chercheur
            </Header>

            {}
            <Input
                placeholder="Nom Complet"
                w="100%"
                mb="lg"
                onChangeText={(text) => handleInputChange(setFullName, text)}
                value={fullName}
                borderColor="gray400"
                focusBorderColor="green500"
            />

            {}
            <Input
                placeholder="Mot de Passe"
                w="100%"
                mb="lg"
                secureTextEntry
                onChangeText={(text) => handleInputChange(setPassword, text)}
                value={password}
                borderColor="gray400"
                focusBorderColor="green500"
            />

            {}
            <Input
                placeholder="Code Centre"
                w="100%"
                mb="lg"
                onChangeText={(text) => handleInputChange(setCodeCentre, text)}
                value={codeCentre}
                borderColor="gray400"
                focusBorderColor="green500"
            />

            {}
            <Input
                placeholder="Code"
                w="100%"
                mb="lg"
                onChangeText={(text) => handleInputChange(setCode, text)}
                value={code}
                borderColor="gray400"
                focusBorderColor="green500"
            />

            {}
            <Button
                w="100%"
                bg={errorMessage ? 'red600' : successMessage ? 'green700' : 'green500'}
                color="white"
                fontWeight="bold"
                onPress={handleAddChercheur}
                disabled={loading}
                loading={loading}
                loaderColor="white"
            >
                {loading ? 'Ajout...' : (errorMessage ? errorMessage : successMessage || 'Ajouter Chercheur')}
            </Button>
        </Div>
    );
};

export default AddChercheurPage;
