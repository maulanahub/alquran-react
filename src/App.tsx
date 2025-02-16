import React, { useEffect, useState } from 'react';
import { Book, Search, Volume2, PauseCircle } from 'lucide-react';
import { Surah, Ayah } from './types';

function App() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('https://quran-api.santrikoding.com/api/surah')
      .then(res => res.json())
      .then(data => {
        setSurahs(data);
        setLoading(false);
      });
  }, []);

  const fetchAyahs = async (surahNumber: number) => {
    setLoadingAyahs(true);
    try {
      const response = await fetch(`https://quran-api.santrikoding.com/api/surah/${surahNumber}`);
      const data = await response.json();
      setAyahs(data.ayat);
      setSelectedSurah(data);
    } catch (error) {
      console.error('Error fetching ayahs:', error);
    }
    setLoadingAyahs(false);
  };

  const toggleAudio = (audioUrl: string) => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      const newAudio = new Audio(audioUrl);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    }
  };

  const filteredSurahs = surahs.filter(surah => 
    surah.nama_latin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.arti.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-6 md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <Book className="w-8 h-8 text-teal-600" />
              <h1 className="text-2xl font-bold text-gray-900">Al-Qur'an Digital</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari surah..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.nomor}
                      onClick={() => fetchAyahs(surah.nomor)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-teal-100 rounded-lg text-teal-600 font-medium">
                            {surah.nomor}
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-medium">{surah.nama_latin}</h3>
                            <p className="text-sm text-gray-500">{surah.arti}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{surah.jumlah_ayat} ayat</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              {loadingAyahs ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                </div>
              ) : selectedSurah && (
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">{selectedSurah.nama_latin}</h2>
                    <p className="text-gray-600">{selectedSurah.arti}</p>
                    <p className="text-sm text-gray-500">{selectedSurah.tempat_turun} • {selectedSurah.jumlah_ayat} Ayat</p>
                    <button
                      onClick={() => toggleAudio(selectedSurah.audio)}
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-150 ease-in-out"
                    >
                      {isPlaying ? (
                        <>
                          <PauseCircle className="w-4 h-4 mr-2" />
                          Pause Audio
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Play Audio
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {ayahs.map((ayah) => (
                      <div key={ayah.nomor} className="p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <span className="w-8 h-8 flex items-center justify-center bg-teal-100 rounded-lg text-teal-600 font-medium">
                            {ayah.nomor}
                          </span>
                        </div>
                        <p className="text-right text-2xl leading-loose mb-4 font-arabic" dangerouslySetInnerHTML={{ __html: ayah.ar }} />
                        <p className="text-gray-600 mb-2 font-arabic" dangerouslySetInnerHTML={{ __html: ayah.tr }} />
                        <p className="text-gray-800">{ayah.idn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;