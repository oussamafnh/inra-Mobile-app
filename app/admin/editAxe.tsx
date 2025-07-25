import React, { useState, useEffect } from 'react';
import { Button, Div, Header, Input, Icon, Toggle, Text } from 'react-native-magnus';
import { TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

interface AxeParams {
    _id?: string;
    AXE?: string;
    status?: string;
    axe_id?: string;
}

export default function EditAxe() {
    const router = useRouter();
    const params = useLocalSearchParams<AxeParams>();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [AXE, setAXE] = useState<string>('');
    const [status, setStatus] = useState<boolean>(false);

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (params?.AXE && !initialized) {
            setAXE(params.AXE);
            setInitialized(true);
        }
        if (params?.status && !initialized) {
            setStatus(params.status === 'active');
        }
    }, [params, initialized]);

    const handleEdit = async () => {
        if (!AXE) {
            setErrorMessage('Veuillez remplir tous les champs');
            setSuccessMessage('');
            return;
        }

        try {
            const storedToken = await getItem('authToken');
            setLoading(true);
            setErrorMessage('');

            const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/axes/${params?.axe_id}`,
                { AXE },
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                setSuccessMessage('Axe a été modifié avec succès!');
                setTimeout(() => {
                    router.back();
                }, 1000);
            } if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }

        } catch (error) {
            setErrorMessage('Erreur lors de la mise à jour de l\'axe.');
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const storedToken = await getItem('authToken');
            const response = await axios.patch(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/axes/${params?.axe_id}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                const newStatus = response.data.axes.status;
                setStatus(newStatus === "active");
            } if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }

        } catch (error) {
            setErrorMessage('Erreur lors de la mise à jour du statut.');
        }
    };

    const handleDelete = async () => {
        try {
            const storedToken = await getItem('authToken');
            const response = await axios.delete(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/axes/${params?.axe_id}`,
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                setSuccessMessage('Axe supprimé avec succès!');
                setTimeout(() => {
                    router.back();
                }, 1000);
            } if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }

        } catch (error) {
            setErrorMessage('Erreur lors de la suppression de l\'axe.');
            setSuccessMessage('');
        }
    };

    const handleAXEChange = (text: string) => {
        setAXE(text);
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    return (
        <Div flex={1} bg="gray100">
            <Header
                p="lg"
                borderBottomWidth={1}
                borderBottomColor="gray200"
                bg="white"
                alignment="center"
                prefix={
                    <Button bg="transparent" onPress={() => router.back()}>
                        <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
                    </Button>
                }
            >
                <Text>Modifier Axe</Text>
            </Header>

            <Div flex={1} p="lg" justifyContent="space-between">
                {}
                <Div row alignItems="center" justifyContent="space-between" mb="lg">
                    <Text>Status: {status ? 'Actif' : 'Inactif'}</Text>
                    <Toggle on={status} onPress={toggleStatus} bg={status ? "green500" : "gray400"} />
                </Div>

                {}
                <Div flex={1} justifyContent="center">
                    <Text mb="sm">Axe :</Text>
                    <Input
                        onChangeText={handleAXEChange}
                        placeholder="Nom de l'Axe"
                        value={AXE}
                        mb="lg"
                        borderColor="gray300"
                        rounded="md"
                        multiline
                        style={{ textAlignVertical: 'top', minHeight: 40 }}
                    />

                    <Button
                        mt="xl"
                        bg={errorMessage ? 'red600' : successMessage ? 'green800' : 'green600'}
                        color="white"
                        w="100%"
                        onPress={handleEdit}
                        loading={loading}
                        disabled={loading}
                    >
                        <Text color="white">
                            {errorMessage ? errorMessage : successMessage ? successMessage : 'Modifier'}
                        </Text>
                    </Button>
                </Div>

                {}
                <Button mt="lg" bg="red600" color="white" w="100%" onPress={() => setModalVisible(true)}>
                    <Icon name="trash" fontFamily="Feather" color="white" fontSize="lg" mr="2" />
                    <Text color="white">Supprimer</Text>
                </Button>
            </Div>

            {}
            {modalVisible && (
                <>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <Div
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg="black"
                            opacity={0.7}
                            zIndex={999}
                        />
                    </TouchableWithoutFeedback>

                    <Div
                        p="xl"
                        rounded="md"
                        bg="white"
                        position="absolute"
                        bottom={0}
                        w="100%"
                        zIndex={1000}
                    >
                        <Div flex={1} justifyContent="center" alignItems="center" p="xl">
                            <Text fontSize="lg" mb="lg" fontWeight="bold">
                                Êtes-vous sûr ?
                            </Text>
                            <Text mb="xl" textAlign="center">
                                Voulez-vous vraiment supprimer cet axe ?
                            </Text>
                            <Div row justifyContent="center" w="100%" p="md">
                                <Button bg="gray400" onPress={() => setModalVisible(false)} w={120} mr="lg">
                                    <Text color="white">Non</Text>
                                </Button>
                                <Button bg="red600" onPress={handleDelete} w={120}>
                                    <Text color="white">Oui</Text>
                                </Button>
                            </Div>
                        </Div>
                    </Div>
                </>
            )}
        </Div>
    );
}
