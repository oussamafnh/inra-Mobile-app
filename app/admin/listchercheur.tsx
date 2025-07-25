import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, Input, Div, Text, Header, Icon, ScrollDiv } from 'react-native-magnus';
import { saveItem, getItem, deleteItem } from '../utils/authToken';
import { useRouter } from 'expo-router';

interface Chercheur {
    _id: string;
    fullName: string;
    created_at: string;
    status: string;
}

export default function ListChercheur() {
    const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchChercheurs = async () => {
            try {
                setLoading(true);
                const storedToken = await getItem('authToken');

                if (!storedToken) {
                    router.push('/auth');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/chercheurs`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });

                if (!response.ok) {
                    const responseData = await response.json();
                    if (responseData.message === "User not found" || responseData.message === "No auth token provided") {
                        router.push('/auth');
                        setLoading(false);
                        return;
                    }
                    throw new Error('Failed to fetch chercheurs');
                }

                const data: Chercheur[] = await response.json();
                setChercheurs(data);
            } catch (error: any) {
                setError('Failed to fetch chercheurs');
            } finally {
                setLoading(false);
            }
        };

        fetchChercheurs();
    }, []);

    const renderChercheurItem = (chercheur: Chercheur) => {
        const isActive = chercheur.status === 'active';
        return (
            <Button
                key={chercheur._id}
                p="lg"
                mb="md"
                rounded="md"
                flexDir="row"
                alignItems="center"
                justifyContent="space-between"
                bg="white"
                block
                borderWidth={1}
                borderColor="gray300"
                onPress={() => router.push(`/admin/profilechercheur?id=${chercheur._id}`)}
            >
                <Div flex={1} mr="md">
                    <Text fontSize="lg" fontWeight="bold">{chercheur.fullName}</Text>
                    <Text fontSize="sm" color="gray700">
                        code centre : {chercheur.codeCentre}
                    </Text>
                </Div>
                <Div
                    bg={isActive ? "green500" : "gray400"}
                    w={12}
                    h={12}
                    rounded="circle"
                />
                <Text ml="md" fontSize="sm" color="gray600">
                    {isActive ? 'Active' : 'Inactive'}
                </Text>
            </Button>
        );
    };

    return (
        <Div flex={1} bg="gray100">
            { }
            <Header
                p="lg"
                borderBottomWidth={1}
                borderBottomColor="gray200"
                alignment="center"
                bg="white"
                prefix={
                    <Button bg="transparent" onPress={() => router.back()}>
                        <Icon name="arrow-left" fontFamily="Feather" fontSize="2xl" />
                    </Button>
                }
            >
                List des Chercheurs
            </Header>

            { }
            <Div flex={1} mt="lg" p="lg">
                { }
                <Button
                    mb="lg"
                    bg="green500"
                    color="white"
                    w="100%"
                    onPress={() => router.push('/admin/addchercheur')}
                    prefix={<Icon name="plus" fontFamily="Feather" fontSize="lg" color="white" />}
                >
                    Ajouter un chercheur
                </Button>
                <Input
                    mb="lg"
                    placeholder="Rechercher un chercheur..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    borderWidth={1}
                    rounded="md"
                    borderColor="gray300"
                    p="md"
                    bg="white"
                    suffix={
                        <Icon
                            name="search"
                            fontFamily="Feather"
                            color="gray500"
                            fontSize="lg"
                        />
                    }
                />

                <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <Div flex={1} justifyContent="center" alignItems="center">
                            <ActivityIndicator size="large" color="blue" />
                        </Div>
                    ) : error ? (
                        <Div flex={1} justifyContent="center" alignItems="center">
                            <Text color="red500">{error}</Text>
                        </Div>
                    ) : (
                        chercheurs
                            .filter((chercheur) =>
                                chercheur.fullName.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((chercheur) => renderChercheurItem(chercheur))
                    )}
                </ScrollDiv>

            </Div>
        </Div>
    );
}
