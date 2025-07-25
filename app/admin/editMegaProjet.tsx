import React, { useState, useEffect } from 'react';
import { Button, Div, Header, Input, Icon, Toggle, Text } from 'react-native-magnus';
import { TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';

interface MegaProjetParams {
    megaprojet_id?: string;
    MEGAPROJET?: string;
    filiere?: string;
    COORDINATEUR?: string;
    status?: string;
}

export default function EditMegaProjet() {
    const router = useRouter();
    const params = useLocalSearchParams<MegaProjetParams>();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [MEGAPROJET, setMEGAPROJET] = useState<string>('');
    const [filiere, setFiliere] = useState<string>('');
    const [COORDINATEUR, setCOORDINATEUR] = useState<string>('');
    const [status, setStatus] = useState<boolean>(false);

    useEffect(() => {
        if (params) {
            setMEGAPROJET(params.MEGAPROJET || '');
            setFiliere(params.filiere || '');
            setCOORDINATEUR(params.COORDINATEUR || '');
            setStatus(params.status === 'active');
        }
    }, []);

    const handleEdit = async () => {
        if (!MEGAPROJET || !filiere  || !COORDINATEUR) {
            setErrorMessage('Veuillez remplir tous les champs');
            setSuccessMessage('');
            return;
        }

        try {
            const storedToken = await getItem('authToken');
            setLoading(true);
            const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/${params?.megaprojet_id}`,
                { MEGAPROJET, filiere, COORDINATEUR },
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                setSuccessMessage('MegaProjet a été modifié avec succès!');
                setErrorMessage('');
                setLoading(false);

                setTimeout(() => {
                    router.back();
                }, 1000);
            }if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }
        } catch (error) {
            setErrorMessage('Erreur lors de la mise à jour du mégaprojet.');
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const storedToken = await getItem('authToken');
            const response = await axios.patch(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/${params?.megaprojet_id}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                const newStatus = response.data.megaprojet.status === 'active';
                setStatus(newStatus);
            }if (response.data.message === "User not found") {
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
                `${process.env.EXPO_PUBLIC_API_URL}/projets/megaprojets/${params?.megaprojet_id}`,
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );

            if (response.status === 200) {
                setSuccessMessage('MegaProjet supprimé avec succès!');
                setErrorMessage('');
                setTimeout(() => {
                    router.back();
                }, 1000);
            }if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }
        } catch (error) {
            setErrorMessage('Erreur lors de la suppression du mégaprojet.');
            setSuccessMessage('');
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
                <Text>Modifier Mégaprojet</Text>
            </Header>

            <Div flex={1} p="lg" justifyContent="space-between">
                {}
                <Div row alignItems="center" justifyContent="space-between" mb="lg">
                    <Text>Status: {status ? 'Actif' : 'Inactif'}</Text>
                    <Toggle
                        on={status}
                        onPress={toggleStatus}
                        bg={status ? "green500" : "gray400"}
                    />
                </Div>

                {}
                <Div flex={1} justifyContent="center">
                    <Text mb="sm">Mégaprojet :</Text>
                    <Input
                        onChangeText={setMEGAPROJET}
                        placeholder="Nom du Mégaprojet"
                        value={MEGAPROJET}
                        mb="lg"
                        borderColor="gray300"
                        rounded="md"
                        multiline
                        style={{
                            textAlignVertical: 'top',
                            minHeight: 40,
                        }}
                    />

                    <Text mb="sm">Filière :</Text>
                    <Input
                        onChangeText={setFiliere}
                        placeholder="Filière"
                        value={filiere}
                        mb="lg"
                        borderColor="gray300"
                        rounded="md"
                        multiline
                        style={{
                            textAlignVertical: 'top',
                            minHeight: 40,
                        }}
                    />
                    {}
                    <Text mb="sm">Coordinateur :</Text>
                    <Input
                        onChangeText={setCOORDINATEUR}
                        placeholder="Coordinateur"
                        value={COORDINATEUR}
                        mb="lg"
                        borderColor="gray300"
                        rounded="md"
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
                            {errorMessage
                                ? errorMessage
                                : successMessage
                                    ? successMessage
                                    : 'Modifier'}
                        </Text>
                    </Button>
                </Div>

                {}
                <Button
                    mt="lg"
                    bg="red600"
                    color="white"
                    w="100%"
                    onPress={() => setModalVisible(true)}
                >
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
                                Voulez-vous vraiment supprimer ce mégaprojet ?
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
