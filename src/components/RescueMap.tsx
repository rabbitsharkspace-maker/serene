import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map as GoogleMap, useMap, useMapsLibrary, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Info, Star, Compass } from 'lucide-react';
import { useLocale, getInterpreterName } from '../lib/locale';
import { useL, pickLang } from '../lib/i18n';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== '';

interface RescueMapProps {
  country: string;
  countryName: string;
}

const SAMPLE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  AU: { lat: -37.8124, lng: 144.9648 }, // Melbourne VIC
  US: { lat: 40.7484, lng: -73.9857 },  // Manhattan NY
  UK: { lat: 51.5033, lng: -0.1276 },   // London UK
  CA: { lat: 43.6426, lng: -79.3871 },  // Toronto ON
};

export default function RescueMap({ country, countryName }: RescueMapProps) {
  const [category, setCategory] = useState<'police' | 'hospital' | 'pharmacy' | 'chinese_gp'>('police');
  const { language } = useLocale();
  const L = useL();
  // Same-language GP: Chinese for zh, any GP for English, otherwise a GP speaking the user's language.
  const gpLang = getInterpreterName(language).replace(/^Mandarin /, '');

  const CATEGORIES = [
    { id: 'police' as const, label: L({ zh: '👮 最近警局', en: '👮 Nearest police', es: '👮 Policía más cercana', hi: '👮 नज़दीकी पुलिस स्टेशन', vi: '👮 Đồn cảnh sát gần nhất', ar: '👮 أقرب مركز شرطة' }), searchSuffix: 'police station' },
    { id: 'hospital' as const, label: L({ zh: '🏥 24h 急诊', en: '🏥 24h emergency', es: '🏥 Urgencias 24 h', hi: '🏥 24 घंटे इमरजेंसी', vi: '🏥 Cấp cứu 24h', ar: '🏥 طوارئ 24 ساعة' }), searchSuffix: 'hospital emergency room department' },
    { id: 'pharmacy' as const, label: L({ zh: '💊 24h 药房', en: '💊 24h pharmacy', es: '💊 Farmacia 24 h', hi: '💊 24 घंटे फ़ार्मेसी', vi: '💊 Nhà thuốc 24h', ar: '💊 صيدلية 24 ساعة' }), searchSuffix: '24 hour pharmacy chemist' },
    {
      id: 'chinese_gp' as const,
      // Visible label is localized; the search query below stays English for Google Places.
      label: L({
        zh: '🩺 华人 GP',
        en: language === 'en' ? '🩺 Nearest GP' : `🩺 ${gpLang}-speaking GP`,
        es: '🩺 Médico de cabecera que hable español',
        hi: '🩺 हिंदी बोलने वाला GP',
        vi: '🩺 GP nói tiếng Việt',
        ar: '🩺 طبيب عام يتحدث العربية',
      }),
      searchSuffix: language === 'zh'
        ? 'Chinese speaking GP clinic medical centre'
        : language === 'en' ? 'GP clinic medical centre' : `${gpLang} speaking GP clinic medical centre`,
    }
  ];

  if (!hasValidKey) {
    // Elegant fallback UI when API key is missing, using safe iframe search
    const currentCat = CATEGORIES.find(c => c.id === category);
    // Match on the country code: countryName is localized (e.g. 'Australia' for non-zh users).
    const fallbackQuery = `${currentCat?.searchSuffix || 'police station'} near ${country === 'AU' ? 'Melbourne VIC' : countryName}`;

    return (
      <div className="flex flex-col space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                category === cat.id
                  ? 'bg-red-600 text-white shadow-md border border-red-600'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-800 uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded-lg">
              {L({ zh: '🛡️ 高级地图能力已就绪', en: '🛡️ Advanced maps available', es: '🛡️ Mapas avanzados disponibles', hi: '🛡️ एडवांस्ड मैप उपलब्ध', vi: '🛡️ Có bản đồ nâng cao', ar: '🛡️ الخرائط المتقدمة متاحة' })}
            </span>
            <h5 className="text-sm font-black text-amber-900 leading-snug">
              {L({ zh: '检测到您正在使用本地演示版地图', en: "You're viewing the basic demo map", es: 'Estás viendo el mapa de demostración básico', hi: 'आप बेसिक डेमो मैप देख रहे हैं', vi: 'Bạn đang xem bản đồ demo cơ bản', ar: 'أنت تشاهد الخريطة التجريبية الأساسية' })}
            </h5>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {L({ zh: '若要解锁', en: 'To unlock ', es: 'Para desbloquear ', hi: '', vi: 'Để mở khóa ', ar: 'لفتح ' })}
              <strong>{L({ zh: '真实 GPS 邻近推荐、一键计算步行/公交路径规划、实时耗时估算', en: 'real GPS nearby results, walking/public transport directions and live travel times', es: 'resultados cercanos con GPS real, rutas a pie o en transporte público y tiempos de viaje en vivo', hi: 'असली GPS से नज़दीकी नतीजे, पैदल/सार्वजनिक परिवहन के रास्ते और लाइव यात्रा समय', vi: 'kết quả lân cận theo GPS thực, chỉ đường đi bộ/phương tiện công cộng và thời gian di chuyển trực tiếp', ar: 'نتائج قريبة بنظام GPS حقيقي، واتجاهات المشي/المواصلات العامة، وأوقات التنقل المباشرة' })}</strong>
              {L({ zh: '等核心加分项：', en: ':', es: ':', hi: ' अनलॉक करने के लिए:', vi: ':', ar: ':' })}
            </p>
            <ol className="text-xs text-amber-800/90 leading-relaxed list-decimal pl-4 space-y-1">
              <li>
                {L({ zh: '点击右上角 ', en: 'Click ', es: 'Haz clic en ', hi: 'ऊपर दाईं ओर ', vi: 'Nhấn ', ar: 'انقر على ' })}
                <strong>{L({ zh: 'Settings (⚙️齿轮图标)', en: 'Settings (⚙️ gear icon)', es: 'Settings (⚙️ icono de engranaje)', hi: 'Settings (⚙️ गियर आइकन)', vi: 'Settings (⚙️ biểu tượng bánh răng)', ar: 'Settings (⚙️ أيقونة الترس)' })}</strong>
                {L({ zh: '', en: ' at the top right', es: ' arriba a la derecha', hi: ' पर क्लिक करें', vi: ' ở góc trên bên phải', ar: ' في أعلى اليمين' })}
              </li>
              <li>
                {L({ zh: '选择 ', en: 'Choose ', es: 'Elige ', hi: '', vi: 'Chọn ', ar: 'اختر ' })}
                <strong>Secrets</strong>
                {L({ zh: '', en: '', es: '', hi: ' चुनें', vi: '', ar: '' })}
              </li>
              <li>
                {L({ zh: '添加 ', en: 'Add ', es: 'Añade ', hi: '', vi: 'Thêm ', ar: 'أضف ' })}
                <code>GOOGLE_MAPS_PLATFORM_KEY</code>
                {L({ zh: ' 填入您的 Google Maps API Key', en: ' with your Google Maps API key', es: ' con tu clave de API de Google Maps', hi: ' जोड़ें और उसमें अपनी Google Maps API key डालें', vi: ' với khóa API Google Maps của bạn', ar: ' مع مفتاح Google Maps API الخاص بك' })}
              </li>
            </ol>
            <p className="text-[10px] text-amber-600/95 font-bold">
              {L({
                zh: `* 目前系统已为您展示了基于 iframe 的基础查询："${fallbackQuery}"`,
                en: `* For now we're showing a basic embedded search: "${fallbackQuery}"`,
                es: `* Por ahora mostramos una búsqueda básica integrada: "${fallbackQuery}"`,
                hi: `* फ़िलहाल हम एक बेसिक एम्बेडेड खोज दिखा रहे हैं: "${fallbackQuery}"`,
                vi: `* Hiện chúng tôi đang hiển thị tìm kiếm nhúng cơ bản: "${fallbackQuery}"`,
                ar: `* نعرض حاليًا بحثًا مضمّنًا أساسيًا: "${fallbackQuery}"`,
              })}
            </p>
          </div>

          <div className="md:col-span-7 h-[300px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
            <iframe
              title="rescue-map-fallback"
              src={`https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`}
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <RescueMapInner
        country={country}
        countryName={countryName}
        category={category}
        setCategory={setCategory}
        CATEGORIES={CATEGORIES}
      />
    </APIProvider>
  );
}

interface RescueMapInnerProps {
  country: string;
  countryName: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'chinese_gp';
  setCategory: (cat: 'police' | 'hospital' | 'pharmacy' | 'chinese_gp') => void;
  CATEGORIES: { id: 'police' | 'hospital' | 'pharmacy' | 'chinese_gp'; label: string; searchSuffix: string }[];
}

function RescueMapInner({ country, countryName, category, setCategory, CATEGORIES }: RescueMapInnerProps) {
  const { language } = useLocale();
  const L = useL();
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  const userCoords = SAMPLE_COORDINATES[country] || SAMPLE_COORDINATES.AU;

  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.Place | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<'WALKING' | 'TRANSIT'>('WALKING');
  
  // Route details
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // 1. Search for nearby places whenever category or country coordinates change
  useEffect(() => {
    if (!placesLib || !map) return;

    const currentCat = CATEGORIES.find(c => c.id === category);
    if (!currentCat) return;

    // Match on the country code: countryName is localized (e.g. 'Australia' for non-zh users).
    const query = `${currentCat.searchSuffix} near ${country === 'AU' ? 'Melbourne VIC' : countryName}`;
    
    placesLib.Place.searchByText({
      textQuery: query,
      fields: ['displayName', 'location', 'formattedAddress', 'rating', 'id'],
      locationBias: userCoords,
      maxResultCount: 6,
    })
      .then(({ places: foundPlaces }) => {
        setPlaces(foundPlaces || []);
        setSelectedPlace(null);
        setRouteInfo(null);
        polylinesRef.current.forEach(p => p.setMap(null));
        polylinesRef.current = [];

        map.setCenter(userCoords);
        map.setZoom(14);
      })
      .catch((err) => {
        console.error("Places Search failed:", err);
      });
  }, [placesLib, map, category, country, countryName, language]);

  // 2. Compute Routes when a place is selected or travel mode changes
  useEffect(() => {
    if (!routesLib || !map || !selectedPlace?.location) {
      setRouteInfo(null);
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
      return;
    }

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    const destLocation = selectedPlace.location;

    routesLib.Route.computeRoutes({
      origin: userCoords,
      destination: { lat: destLocation.lat(), lng: destLocation.lng() },
      travelMode: travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const route = routes[0];
          const polylines = route.createPolylines();
          polylines.forEach(p => {
            p.setOptions({
              strokeColor: travelMode === 'WALKING' ? '#3B82F6' : '#EF4444',
              strokeOpacity: 0.8,
              strokeWeight: 5,
            });
            p.setMap(map);
          });
          polylinesRef.current = polylines;

          const distMeters = route.distanceMeters || 0;
          const durationSec = parseInt(String(route.durationMillis || '0'), 10) / 1000;

          const distanceStr = distMeters >= 1000 
            ? `${(distMeters / 1000).toFixed(1)} km` 
            : `${distMeters} ${pickLang({ zh: '米', en: 'm', es: 'm', hi: 'm', vi: 'm', ar: 'm' }, language)}`;

          const durationStr = durationSec >= 60 
            ? `${Math.round(durationSec / 60)} ${pickLang({ zh: '分钟', en: 'min', es: 'min', hi: 'min', vi: 'min', ar: 'min' }, language)}` 
            : `${Math.round(durationSec)} ${pickLang({ zh: '秒', en: 's', es: 's', hi: 's', vi: 's', ar: 's' }, language)}`;

          setRouteInfo({
            distance: distanceStr,
            duration: durationStr
          });

          if (route.viewport) {
            map.fitBounds(route.viewport);
          }
        }
      })
      .catch((err) => {
        console.error("Routes compute failed:", err);
        setRouteInfo(null);
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, selectedPlace, travelMode, country, language]);

  const handlePlaceSelect = (place: google.maps.places.Place) => {
    setSelectedPlace(place);
    if (place.location && map) {
      map.panTo({ lat: place.location.lat(), lng: place.location.lng() });
      map.setZoom(15);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              category === cat.id
                ? 'bg-red-600 text-white shadow-md border border-red-600'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left column: Places List */}
        <div className="md:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {places.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Compass size={32} className="mx-auto mb-2 opacity-50 animate-spin" />
              <p className="text-xs font-bold">{L({ zh: '正在搜寻附近救援点...', en: 'Searching for help nearby...', es: 'Buscando ayuda cerca...', hi: 'आस-पास मदद खोजी जा रही है...', vi: 'Đang tìm trợ giúp gần bạn...', ar: 'جارٍ البحث عن مساعدة قريبة...' })}</p>
            </div>
          ) : (
            places.map((place, idx) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <div
                  key={place.id || idx}
                  onClick={() => handlePlaceSelect(place)}
                  onMouseEnter={() => setHoveredPlaceId(place.id)}
                  onMouseLeave={() => setHoveredPlaceId(null)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-red-50/80 border-red-200 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-black text-gray-900 leading-tight flex-1">
                      {idx + 1}. {place.displayName}
                    </h5>
                    {place.rating && (
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-500 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100/60">
                        <Star size={10} className="fill-amber-500" />
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    {place.formattedAddress}
                  </p>

                  {/* Route planning UI when selected */}
                  {isSelected && (
                    <div className="mt-3.5 pt-3 border-t border-red-100/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">{L({ zh: '出行路径规划', en: 'Directions', es: 'Cómo llegar', hi: 'रास्ता', vi: 'Chỉ đường', ar: 'الاتجاهات' })}</span>
                        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTravelMode('WALKING'); }}
                            className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all ${
                              travelMode === 'WALKING'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {L({ zh: '🚶 步行', en: '🚶 Walk', es: '🚶 A pie', hi: '🚶 पैदल', vi: '🚶 Đi bộ', ar: '🚶 مشيًا' })}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTravelMode('TRANSIT'); }}
                            className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all ${
                              travelMode === 'TRANSIT'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {L({ zh: '🚌 公交/轻轨', en: '🚌 Public transport', es: '🚌 Transporte público', hi: '🚌 सार्वजनिक परिवहन', vi: '🚌 Phương tiện công cộng', ar: '🚌 المواصلات العامة' })}
                          </button>
                        </div>
                      </div>

                      {routeInfo ? (
                        <div className="bg-red-500/10 text-red-700 text-xs font-black p-2 rounded-xl flex items-center justify-between border border-red-200/55">
                          <span className="flex items-center gap-1">
                            <Navigation size={12} className="animate-pulse" />
                            {L({ zh: '预计路程: ', en: 'Distance: ', es: 'Distancia: ', hi: 'दूरी: ', vi: 'Quãng đường: ', ar: 'المسافة: ' })}{routeInfo.distance}
                          </span>
                          <span>{L({ zh: '耗时约为: ', en: 'About ', es: 'Unos ', hi: 'लगभग ', vi: 'Khoảng ', ar: 'حوالي ' })}{routeInfo.duration}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 font-bold animate-pulse text-center">
                          {L({ zh: '正在实时计算路线...', en: 'Calculating route...', es: 'Calculando la ruta...', hi: 'रास्ता निकाला जा रहा है...', vi: 'Đang tính lộ trình...', ar: 'جارٍ حساب المسار...' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Interactive Map with markers */}
        <div className="md:col-span-7 h-[380px] rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner bg-gray-50">
          <GoogleMap
            defaultCenter={userCoords}
            defaultZoom={14}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling={'cooperative'}
            disableDefaultUI={true}
          >
            {/* Default User Center marker */}
            <AdvancedMarker
              position={userCoords}
              title={L({ zh: '你的当前位置', en: 'Your current location', es: 'Tu ubicación actual', hi: 'आपकी मौजूदा लोकेशन', vi: 'Vị trí hiện tại của bạn', ar: 'موقعك الحالي' })}
              onClick={() => {
                setSelectedPlace(null);
                setRouteInfo(null);
                map?.panTo(userCoords);
                map?.setZoom(14);
              }}
            >
              <Pin background="#4285F4" glyphColor="#fff" scale={1.1}>
                <span className="text-[10px] font-bold text-white">{L({ zh: '我', en: 'Me', es: 'Yo', hi: 'मैं', vi: 'Tôi', ar: 'أنا' })}</span>
              </Pin>
            </AdvancedMarker>

            {/* Markers for places */}
            {places.map((place, idx) => {
              const isSelected = selectedPlace?.id === place.id;
              const isHovered = hoveredPlaceId === place.id;
              const loc = place.location;
              if (!loc) return null;

              const markerPos = { lat: loc.lat(), lng: loc.lng() };

              return (
                <AdvancedMarker
                  key={place.id || idx}
                  position={markerPos}
                  title={place.displayName || ''}
                  onClick={() => handlePlaceSelect(place)}
                >
                  <Pin
                    background={isSelected ? '#EF4444' : isHovered ? '#FE5D4C' : '#EA4335'}
                    glyphColor="#fff"
                    scale={isSelected ? 1.25 : 1.0}
                  >
                    <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Info Window for selected marker */}
            {selectedPlace && selectedPlace.location && (
              <InfoWindow
                position={{ lat: selectedPlace.location.lat(), lng: selectedPlace.location.lng() }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="p-1 max-w-[200px] text-left">
                  <h6 className="text-xs font-black text-gray-900 leading-tight mb-0.5">
                    {selectedPlace.displayName}
                  </h6>
                  <p className="text-[10px] text-gray-500 leading-normal mb-1.5 font-semibold">
                    {selectedPlace.formattedAddress}
                  </p>
                  {selectedPlace.rating && (
                    <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-150 inline-block">
                      <Star size={9} className="fill-amber-500" />
                      {L({ zh: '评分: ', en: 'Rating: ', es: 'Valoración: ', hi: 'रेटिंग: ', vi: 'Đánh giá: ', ar: 'التقييم: ' })}{selectedPlace.rating.toFixed(1)} / 5.0
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Info Badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-2.5 py-1 text-[9px] font-bold text-gray-500 shadow-sm z-10 pointer-events-none">
            {L({ zh: '📍 蓝色标记点为您的当前位置', en: '📍 The blue marker is your current location', es: '📍 El marcador azul es tu ubicación actual', hi: '📍 नीला मार्कर आपकी मौजूदा लोकेशन है', vi: '📍 Điểm đánh dấu màu xanh là vị trí hiện tại của bạn', ar: '📍 العلامة الزرقاء هي موقعك الحالي' })}
          </div>
        </div>
      </div>
    </div>
  );
}
