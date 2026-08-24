// Французские названия добавок → Е-код или точное имя из additives.json.
// Термины: нижний регистр, без диакритики, апострофы прямые (').
// Мэтчинг — по целым словам в нормализованном тексте состава.
// Длинные термины проверяются первыми, пересекающиеся совпадения отбрасываются.

export const FR_TERMS: [string, string][] = [
  // --- Консерванты ---
  ['acide sorbique', 'E200'],
  ['sorbate de potassium', 'E202'],
  ['sorbate de calcium', 'E203'],
  ['acide benzoique', 'E210'],
  ['benzoate de sodium', 'E211'],
  ['benzoate de potassium', 'E212'],
  ['benzoate de calcium', 'E213'],
  ['dioxyde de soufre', 'E220'],
  ['anhydride sulfureux', 'E220'],
  ['sulfite de sodium', 'E221'],
  ['hydrogenosulfite de sodium', 'E222'],
  ['bisulfite de sodium', 'E222'],
  ['metabisulfite de sodium', 'E223'],
  ['metabisulfite de potassium', 'E224'],
  ['sulfite de potassium', 'E225'],
  ['sulfite de calcium', 'E226'],
  ['nisine', 'E234'],
  ['natamycine', 'E235'],
  ['nitrite de potassium', 'E249'],
  ['nitrite de sodium', 'E250'],
  ['nitrate de sodium', 'E251'],
  ['nitrate de potassium', 'E252'],
  ['salpetre', 'E252'],
  ['acide acetique', 'E260'],
  ['diacetate de sodium', 'E262'],
  ['acetate de sodium', 'E262'],
  ['acide propionique', 'E280'],
  ['propionate de sodium', 'E281'],
  ['propionate de calcium', 'E282'],
  ['propionate de potassium', 'E283'],

  // --- Антиоксиданты / регуляторы кислотности ---
  ['acide ascorbique', 'E300'],
  ['ascorbate de sodium', 'E301'],
  ['ascorbate de calcium', 'E302'],
  ["palmitate d'ascorbyle", 'E304'],
  ['tocopherol', 'E306'],
  ['gallate de propyle', 'E310'],
  ["gallate d'octyle", 'E311'],
  ['gallate de dodecyle', 'E312'],
  ['acide erythorbique', 'E315'],
  ['erythorbate de sodium', 'E316'],
  ['butylhydroxyanisol', 'E320'],
  ['butylhydroxytoluene', 'E321'],
  ['acide lactique', 'E270'],
  ['lactate de sodium', 'E325'],
  ['lactate de potassium', 'E326'],
  ['lactate de calcium', 'E327'],
  ['acide citrique', 'E330'],
  ['citrate de sodium', 'E331'],
  ['citrate de potassium', 'E332'],
  ['citrate de calcium', 'E333'],
  ['acide tartrique', 'E334'],
  ['tartrate de sodium', 'E335'],
  ['tartrate de potassium', 'E336'],
  ['acide phosphorique', 'E338'],
  ['acide orthophosphorique', 'E338'],
  ['phosphate de sodium', 'E339'],
  ['phosphate de potassium', 'E340'],
  ['phosphate de calcium', 'E341'],
  ['malate de sodium', 'E350'],
  ['tartrate de calcium', 'E354'],
  ['ethylenediaminetetraacetate', 'E385'],
  ['edta', 'E385'],
  ['extrait de romarin', 'E392'],
  ['acide malique', 'E296'],
  ['acide fumarique', 'E297'],

  // --- Красители ---
  ['curcumine', 'E100'],
  ['riboflavine', 'E101'],
  ['tartrazine', 'E102'],
  ['jaune de quinoleine', 'E104'],
  ['jaune orange', 'E110'],
  ['jaune soleil', 'E110'],
  ['carmin', 'E120'],
  ['cochenille', 'E120'],
  ['acide carminique', 'E120'],
  ['azorubine', 'E122'],
  ['carmoisine', 'E122'],
  ['rouge cochenille', 'E124'],
  ['ponceau 4r', 'E124'],
  ['erythrosine', 'E127'],
  ['rouge allura', 'E129'],
  ['bleu patente', 'E131'],
  ['indigotine', 'E132'],
  ['bleu brillant', 'E133'],
  ['chlorophylline', 'E141'],
  ['chlorophylle', 'E140'],
  ['vert s', 'E142'],
  ['noir brillant', 'E151'],
  ['charbon vegetal', 'E153'],
  ['brun ht', 'E155'],
  ['rocou', 'E160b'],
  ['annatto', 'E160b'],
  ['oleoresine de paprika', 'E160c'],
  ['extrait de paprika', 'E160c'],
  ['lycopene', 'E160d'],
  ['beta-carotene', 'E160a'],
  ['carotene', 'E160a'],
  ['carotenoides', 'E160a'],
  ['luteine', 'E161b'],
  ['rouge de betterave', 'E162'],
  ['betanine', 'E162'],
  ['anthocyanines', 'E163'],
  ['anthocyanes', 'E163'],
  ['carbonate de calcium', 'E170'],
  ['dioxyde de titane', 'E171'],
  ['oxyde de fer', 'E172'],
  ['caramel', 'E150'],

  // --- Эмульгаторы / загустители / стабилизаторы ---
  ['agar-agar', 'E406'],
  ['agar', 'E406'],
  ['carraghenane', 'E407'],
  ['farine de graines de caroube', 'E410'],
  ['gomme de caroube', 'E410'],
  ['gomme guar', 'E412'],
  ['gomme arabique', 'E414'],
  ['gomme xanthane', 'E415'],
  ['gomme tara', 'E417'],
  ['gomme gellane', 'E418'],
  ['sorbitol', 'E420'],
  ['mannitol', 'E421'],
  ['glycerol', 'E422'],
  ['glycerine', 'E422'],
  ['polysorbate 20', 'E432'],
  ['polysorbate 80', 'E433'],
  ['polysorbate 40', 'E434'],
  ['polysorbate 60', 'E435'],
  ['polysorbate 65', 'E436'],
  ['pectine', 'E440'],
  ['diphosphate', 'E450'],
  ['pyrophosphate', 'E450'],
  ['triphosphate', 'E451'],
  ['polyphosphate', 'E452'],
  ['carboxymethylcellulose', 'E466'],
  ['carmellose', 'E466'],
  ['hydroxypropylmethylcellulose', 'E464'],
  ['hydroxypropylcellulose', 'E463'],
  ['methylcellulose', 'E461'],
  ['cellulose', 'E460'],
  ["mono- et diglycerides d'acides gras", 'E471'],
  ["mono et diglycerides d'acides gras", 'E471'],
  ['monoglycerides', 'E471'],
  ['diglycerides', 'E471'],
  ['sucroesters', 'E473'],
  ['polyricinoleate de polyglycerol', 'E476'],
  ['stearoyl-2-lactylate de sodium', 'E481'],
  ['stearoyl-2-lactylate de calcium', 'E482'],
  ['lecithine', 'E322'],
  ['glucono delta-lactone', 'E575'],

  // --- Разрыхлители / соли ---
  ['bicarbonate de sodium', 'E500'],
  ['carbonates de sodium', 'E500'],
  ['carbonate de potassium', 'E501'],
  ['bicarbonate de potassium', 'E501'],
  ["carbonate d'ammonium", 'E503'],
  ["bicarbonate d'ammonium", 'E503'],
  ['carbonate de magnesium', 'E504'],
  ['chlorure de potassium', 'E508'],
  ['chlorure de calcium', 'E509'],
  ['chlorure de magnesium', 'E511'],
  ['sulfate de sodium', 'E514'],
  ['sulfate de calcium', 'E516'],
  ['sulfate de magnesium', 'E518'],
  ['ferrocyanure de sodium', 'E535'],
  ['dioxyde de silicium', 'E551'],
  ['silice colloidale', 'E551'],
  ['talc', 'E553b'],

  // --- Усилители вкуса ---
  ['glutamate monosodique', 'E621'],
  ['monoglutamate de sodium', 'E621'],
  ['glutamate de sodium', 'E621'],
  ['glutamate monopotassique', 'E622'],
  ['guanylate de sodium', 'E627'],
  ['acide inosinique', 'E630'],
  ['inosinate de sodium', 'E631'],
  ['ribonucleotides', 'E635'],

  // --- Подсластители ---
  ['acesulfame de potassium', 'E950'],
  ['acesulfame k', 'E950'],
  ['aspartame', 'E951'],
  ['cyclamate', 'E952'],
  ['isomalt', 'E953'],
  ['saccharine', 'E954'],
  ['sucralose', 'E955'],
  ['thaumatine', 'E957'],
  ['neohesperidine', 'E959'],
  ['glycosides de steviol', 'E960'],
  ['neotame', 'E961'],
  ['maltitol', 'E965'],
  ['lactitol', 'E966'],
  ['xylitol', 'E967'],
  ['erythritol', 'E968'],
  ['polydextrose', 'E1200'],

  // --- Глазирователи / прочие коды ---
  ["cire d'abeille", 'E901'],
  ['cire de carnauba', 'E903'],
  ['gomme-laque', 'E904'],
  ['shellac', 'E904'],
  ['lysozyme', 'E1105'],
  ['dimethylpolysiloxane', 'E900'],

  // --- Добавки без Е-кода (мэтчинг по имени из additives.json) ---
  ['sirop de glucose-fructose', 'Глюкозно-фруктозный сироп'],
  ['sirop de glucose', 'Глюкозно-фруктозный сироп'],
  ['huile de palme', 'Пальмовое масло'],
  ['extrait de levure', 'Дрожжевой экстракт'],
  ['maltodextrine', 'Мальтодекстрин'],
  ['amidon modifie', 'Модифицированный крахмал'],
  ['cafeine', 'Кофеин'],
  ['taurine', 'Таурин'],
  ['quinine', 'Хинин'],
  ['inositol', 'Инозит'],
  ['carnitine', 'L-карнитин'],
  ['phenylalanine', 'Фенилаланин'],
  ['inuline', 'Инулин'],
  ['glycoside de steviol', 'Стевия'],
  ['stevia', 'Стевия'],
  ['hydrogenee', 'Трансжиры / маргарин'],
  ['hydrogene', 'Трансжиры / маргарин'],
  ['sulfites', 'Сульфиты'],
  ['phosphates', 'Фосфаты'],
  ['poudre a lever', 'Разрыхлитель'],
  ['poudre a cake', 'Разрыхлитель'],
  ['hydrolysat de proteines vegetales', 'Гидролизат растительного белка'],
  ['oleoresine', 'Олеорезины специй'],
  ['arome', 'Ароматизатор (неуточнённый)'],
  ['aromes', 'Ароматизатор (неуточнённый)'],
  ['colorant', 'Краситель пищевой'],
  ['conservateur', 'Консервант (неуточнённый)'],
  ['edulcorant', 'Подсластитель (неуточнённый)'],
  ['emulsifiant', 'Эмульгатор'],
  ['epaississant', 'Загуститель'],
  ['stabilisant', 'Стабилизатор'],
  ['gelifiants', 'Загуститель'],
  ['gelifiant', 'Загуститель'],
  ["correcteur d'acidite", 'Регулятор кислотности'],
  ['acidifiant', 'Подкислитель (неуточнённый)'],
  ['exhausteur de gout', 'Усилитель вкуса'],
  ['ameliorant', 'Улучшитель хлебобулочный'],
  ["agent d'enrobage", 'Глазирователь (неуточнённый)'],
  ['agent de glacage', 'Глазирователь (неуточнённый)'],
  ['enzymes', 'Ферментный препарат'],
  ['enzyme', 'Ферментный препарат'],
  ['vitamine', 'Витамины'],
  ['levure', 'Закваска / дрожжи'],
]

// длинные термины первыми — чтобы «extrait de levure» перекрывал «levure»
export const FR_TERMS_SORTED = [...FR_TERMS].sort((a, b) => b[0].length - a[0].length)

export function normFr(s: string): string {
  return ' ' + s
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, ' ') + ' '
}

// Возвращает пары [term, target] для терминов, найденных в тексте (без пересечений)
export function matchFrTerms(text: string): [string, string][] {
  const spans: [number, number][] = []
  const out: [string, string][] = []
  for (const [rawTerm, target] of FR_TERMS_SORTED) {
    const term = rawTerm.replace(/[^a-z0-9']+/g, ' ').trim()
    // дефисы в тексте уже стали пробелами; проверяем и множественное число (+s)
    for (const needle of [' ' + term + ' ', ' ' + term + 's ']) {
      const i = text.indexOf(needle)
      if (i === -1) continue
      // граничные пробелы в спан не включаем: соседние термины делят один пробел
      const span: [number, number] = [i + 1, i + needle.length - 1]
      if (!spans.some(([a, b]) => span[0] < b && a < span[1])) {
        spans.push(span)
        out.push([rawTerm, target])
      }
      break // одного совпадения на термин достаточно
    }
  }
  return out
}
