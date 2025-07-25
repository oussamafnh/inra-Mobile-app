import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Div, Button, Input, Text, Header, Icon } from 'react-native-magnus';
import axios from 'axios';
import { saveItem, getItem, deleteItem } from '../utils/authToken';
export default function AddActivite() {
    const { megaprojet_id, megaprojet_name, axe_id, axe_name } = useLocalSearchParams();
    const [ACTIVITE, setACTIVITE] = useState('');
    const [CodeActivite, setCodeActivite] = useState('');
    const [CRRA, setCRRA] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {

            const storedToken = await getItem('authToken');
            if (!storedToken) {
                router.push('/auth');
                return;
            }

            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/projets/activite`,
                {
                    megaprojet_id,
                    axe_id,
                    CRRA,
                    ACTIVITE,
                    CodeActivite,
                },
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                }
            );
            console.log(response.data);

            if (response.data.message === "Le Code d'activité est déjà utilisé par une autre activité.") {
                setErrorMessage("Le Code d'activité est déjà utilisé par une autre activité.");
                return;
            }
            if (response.data.message === "User not found") {
                router.push('/auth');
                return;
            }

            router.push(`/admin/listactivites?megaprojet_id=${megaprojet_id}&axe_id=${axe_id}`);

        } catch (error: any) {
            setErrorMessage('Failed to add activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        if (errorMessage) setErrorMessage('');
    };

    return (
        <Div flex={1} justifyContent="center" w="100%" alignItems="center" p="xl">
            {}
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
                Ajouter une Activité
            </Header>

            {}
            <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Ajouter une Activité à ce Mégaprojet :
            </Text>

            {}
            <Input
                readOnly
                value={megaprojet_name || 'Nom du mégaprojet non disponible'}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="green500"
                rounded="md"
                p="md"
                bg="gray100"
                textColor="green500"
                multiline
                style={{
                    textAlignVertical: 'top',
                    minHeight: 40,
                }}
            />

            {}
            <Text fontSize="3xl" fontWeight="bold" mb="lg" mt="xxl">
                Dans l'Axe :
            </Text>
            <Input
                readOnly
                value={axe_name || 'Nom de l\'Axe non disponible'}
                mb="lg"
                borderWidth={1}
                w="100%"
                rounded="md"
                p="md"
                bg="gray100"
                borderColor="green500"
                textColor="green500"
                multiline
                style={{
                    textAlignVertical: 'top',
                    minHeight: 40,
                }}
            />

            {}
            <Input
                placeholder="Nom de l'Activité"
                onChangeText={(text) => handleInputChange(setACTIVITE, text)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
                multiline
                style={{
                    textAlignVertical: 'top',
                    minHeight: 40,
                }}
            />

            {}
            <Input
                placeholder="Code de l'Activité"
                onChangeText={(text) => handleInputChange(setCodeActivite, text)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
                multiline
                style={{
                    textAlignVertical: 'top',
                    minHeight: 40,
                }}
            />
            <Input
                placeholder="CRRA"

                onChangeText={(text) => handleInputChange(setCRRA, text)}
                mb="lg"
                borderWidth={1}
                w="100%"
                borderColor="gray300"
                rounded="md"
                p="md"
                bg="white"
            />

            {}
            {!errorMessage ? (
                <Button
                    bg="green500"
                    rounded="md"
                    w="100%"
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
            ) : (
                <Button
                    bg="red600"
                    rounded="md"
                    w="100%"
                    disabled
                >
                    {errorMessage}
                </Button>
            )}
        </Div>
    );
}
